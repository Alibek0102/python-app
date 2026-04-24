from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.models.models import (
    User,
    UserRole,
    Product,
    Order,
    CoinTemplate,
    CoinTemplateType,
    Transaction,
    Treasury,
    TreasuryOperation,
)
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.schemas.user import AdminUserCreate, AdminUserUpdate, AdminUserOut, AdminApplyTemplateIn
from app.schemas.template import CoinTemplateCreate, CoinTemplateUpdate, CoinTemplateOut
from app.schemas.treasury import TreasuryOut, TreasuryIssueIn, TreasuryOperationOut
from app.schemas.transaction import TransactionOut
from app.routes.auth import get_current_user
from app.services.storage import upload_image
from app.services.coin_service import issue_to_treasury, apply_template, TREASURY_ID
from app.core.security import get_password_hash

MAX_UPLOAD_BYTES = 5 * 1024 * 1024

router = APIRouter(prefix="/admin", tags=["admin"])


ADMIN_ROLES = {"ADMIN", "SUPERADMIN"}


async def require_admin(current_user=Depends(get_current_user)):
    if not current_user or current_user.role.value not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def require_superadmin(current_user=Depends(get_current_user)):
    if not current_user or current_user.role.value != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Superadmin access required")
    return current_user


# -------------------- products --------------------


@router.get("/products")
async def admin_get_products(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Product))
    return result.scalars().all()


@router.post("/products", response_model=ProductOut)
async def admin_create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    new_product = Product(**product.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product


@router.put("/products/{product_id}", response_model=ProductOut)
async def admin_update_product(
    product_id: int,
    product: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump(exclude_unset=True).items():
        setattr(db_product, key, value)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@router.delete("/products/{product_id}")
async def admin_delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(db_product)
    await db.commit()
    return {"message": "Product deleted"}


@router.post("/upload")
async def admin_upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
):
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        url = upload_image(data, file.filename or "", file.content_type or "")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")
    return {"url": url}


# -------------------- users --------------------


def _validate_role(role: str) -> UserRole:
    try:
        return UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role (expected USER, ADMIN or SUPERADMIN)")


def _role_level(role: str) -> int:
    return {"USER": 0, "ADMIN": 1, "SUPERADMIN": 2}.get(role, -1)


def _serialize_user(u: User) -> AdminUserOut:
    return AdminUserOut(
        id=u.id, name=u.name, email=u.email, role=u.role.value, coin_balance=u.coin_balance
    )


@router.get("/users", response_model=list[AdminUserOut])
async def admin_list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).order_by(User.id))
    return [_serialize_user(u) for u in result.scalars().all()]


@router.post("/users", response_model=AdminUserOut, status_code=201)
async def admin_create_user(
    payload: AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    role = _validate_role(payload.role)

    if role == UserRole.SUPERADMIN:
        raise HTTPException(status_code=403, detail="Cannot create another SUPERADMIN")
    if role == UserRole.ADMIN and admin.role.value != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Only SUPERADMIN can create ADMIN users")

    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    if payload.coin_balance < 0:
        raise HTTPException(status_code=400, detail="coin_balance must be >= 0")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=role,
        coin_balance=payload.coin_balance,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _serialize_user(user)


@router.get("/users/{user_id}")
async def admin_get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(desc(Transaction.created_at))
        .options(selectinload(Transaction.admin), selectinload(Transaction.template))
    )
    txs = tx_result.scalars().all()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "coin_balance": user.coin_balance,
        "created_at": user.created_at.isoformat(),
        "transactions": [
            TransactionOut(
                id=t.id,
                user_id=t.user_id,
                user_name=user.name,
                amount=t.amount,
                type=t.type.value,
                reason=t.reason,
                admin_id=t.admin_id,
                admin_name=t.admin.name if t.admin else None,
                template_id=t.template_id,
                template_name=t.template.name if t.template else None,
                created_at=t.created_at,
            ).model_dump()
            for t in txs
        ],
    }


@router.put("/users/{user_id}", response_model=AdminUserOut)
async def admin_update_user(
    user_id: int,
    payload: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)

    if user.role.value != "USER" and admin.role.value != "SUPERADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only SUPERADMIN can edit ADMIN/SUPERADMIN users",
        )

    if "email" in data and data["email"] != user.email:
        dup = await db.execute(select(User).where(User.email == data["email"]))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Email already registered")
        user.email = data["email"]

    if "name" in data:
        user.name = data["name"]
    if "role" in data:
        new_role = _validate_role(data["role"])
        if new_role == UserRole.SUPERADMIN:
            raise HTTPException(status_code=403, detail="Cannot promote to SUPERADMIN")
        if new_role == UserRole.ADMIN and admin.role.value != "SUPERADMIN":
            raise HTTPException(
                status_code=403, detail="Only SUPERADMIN can promote to ADMIN"
            )
        user.role = new_role
    if "coin_balance" in data:
        if data["coin_balance"] < 0:
            raise HTTPException(status_code=400, detail="coin_balance must be >= 0")
        user.coin_balance = data["coin_balance"]
    if "password" in data and data["password"]:
        user.password_hash = get_password_hash(data["password"])

    await db.commit()
    await db.refresh(user)
    return _serialize_user(user)


@router.delete("/users/{user_id}")
async def admin_delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role.value != "USER" and admin.role.value != "SUPERADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only SUPERADMIN can delete ADMIN/SUPERADMIN users",
        )
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted"}


# -------------------- orders --------------------


@router.get("/orders")
async def admin_get_orders(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(Order).options(selectinload(Order.user)).options(selectinload(Order.product))
    )
    orders = result.scalars().all()
    return [
        {
            "id": o.id,
            "user_id": o.user_id,
            "user_name": o.user.name if o.user else None,
            "product_id": o.product_id,
            "product_name": o.product.name if o.product else None,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
        }
        for o in orders
    ]


# -------------------- coin templates --------------------


def _validate_template_type(value: str) -> CoinTemplateType:
    try:
        return CoinTemplateType(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid template type (AWARD or PENALTY)")


@router.get("/templates", response_model=list[CoinTemplateOut])
async def admin_list_templates(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(CoinTemplate).order_by(CoinTemplate.id))
    return [
        CoinTemplateOut(
            id=t.id,
            name=t.name,
            type=t.type.value,
            amount=t.amount,
            description=t.description,
            is_active=t.is_active,
        )
        for t in result.scalars().all()
    ]


@router.post("/templates", response_model=CoinTemplateOut, status_code=201)
async def admin_create_template(
    payload: CoinTemplateCreate,
    db: AsyncSession = Depends(get_db),
    su: User = Depends(require_superadmin),
):
    tpl_type = _validate_template_type(payload.type)
    tpl = CoinTemplate(
        name=payload.name,
        type=tpl_type,
        amount=payload.amount,
        description=payload.description,
        is_active=payload.is_active,
    )
    db.add(tpl)
    await db.commit()
    await db.refresh(tpl)
    return CoinTemplateOut(
        id=tpl.id,
        name=tpl.name,
        type=tpl.type.value,
        amount=tpl.amount,
        description=tpl.description,
        is_active=tpl.is_active,
    )


@router.put("/templates/{template_id}", response_model=CoinTemplateOut)
async def admin_update_template(
    template_id: int,
    payload: CoinTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    su: User = Depends(require_superadmin),
):
    result = await db.execute(select(CoinTemplate).where(CoinTemplate.id == template_id))
    tpl = result.scalar_one_or_none()
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")

    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        tpl.name = data["name"]
    if "type" in data:
        tpl.type = _validate_template_type(data["type"])
    if "amount" in data:
        tpl.amount = data["amount"]
    if "description" in data:
        tpl.description = data["description"]
    if "is_active" in data:
        tpl.is_active = data["is_active"]

    await db.commit()
    await db.refresh(tpl)
    return CoinTemplateOut(
        id=tpl.id,
        name=tpl.name,
        type=tpl.type.value,
        amount=tpl.amount,
        description=tpl.description,
        is_active=tpl.is_active,
    )


@router.delete("/templates/{template_id}")
async def admin_delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    su: User = Depends(require_superadmin),
):
    result = await db.execute(select(CoinTemplate).where(CoinTemplate.id == template_id))
    tpl = result.scalar_one_or_none()
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    await db.delete(tpl)
    await db.commit()
    return {"message": "Template deleted"}


# -------------------- treasury --------------------


@router.get("/treasury", response_model=TreasuryOut)
async def admin_get_treasury(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Treasury).where(Treasury.id == TREASURY_ID))
    treasury = result.scalar_one_or_none()
    return TreasuryOut(balance=treasury.balance if treasury else 0)


@router.post("/treasury/issue", response_model=TreasuryOut)
async def admin_issue_treasury(
    payload: TreasuryIssueIn,
    db: AsyncSession = Depends(get_db),
    su: User = Depends(require_superadmin),
):
    try:
        treasury = await issue_to_treasury(db, su, payload.amount, payload.note)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return TreasuryOut(balance=treasury.balance)


@router.get("/treasury/operations", response_model=list[TreasuryOperationOut])
async def admin_treasury_ops(
    db: AsyncSession = Depends(get_db),
    su: User = Depends(require_superadmin),
):
    result = await db.execute(
        select(TreasuryOperation)
        .options(selectinload(TreasuryOperation.performed_by))
        .order_by(desc(TreasuryOperation.created_at))
    )
    ops = result.scalars().all()
    return [
        TreasuryOperationOut(
            id=o.id,
            amount=o.amount,
            note=o.note,
            performed_by_id=o.performed_by_id,
            performed_by_name=o.performed_by.name if o.performed_by else None,
            created_at=o.created_at,
        )
        for o in ops
    ]


# -------------------- apply template --------------------


@router.post("/users/{user_id}/apply-template", response_model=TransactionOut)
async def admin_apply_template(
    user_id: int,
    payload: AdminApplyTemplateIn,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    try:
        tx = await apply_template(db, admin, user_id, payload.template_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    refetch = await db.execute(
        select(Transaction)
        .where(Transaction.id == tx.id)
        .options(
            selectinload(Transaction.admin),
            selectinload(Transaction.template),
            selectinload(Transaction.user),
        )
    )
    t = refetch.scalar_one()
    return TransactionOut(
        id=t.id,
        user_id=t.user_id,
        user_name=t.user.name if t.user else None,
        amount=t.amount,
        type=t.type.value,
        reason=t.reason,
        admin_id=t.admin_id,
        admin_name=t.admin.name if t.admin else None,
        template_id=t.template_id,
        template_name=t.template.name if t.template else None,
        created_at=t.created_at,
    )


# -------------------- coin log --------------------


@router.get("/coin-log", response_model=list[TransactionOut])
async def admin_coin_log(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.admin_id.is_not(None))
        .options(
            selectinload(Transaction.admin),
            selectinload(Transaction.template),
            selectinload(Transaction.user),
        )
        .order_by(desc(Transaction.created_at))
    )
    txs = result.scalars().all()
    return [
        TransactionOut(
            id=t.id,
            user_id=t.user_id,
            user_name=t.user.name if t.user else None,
            amount=t.amount,
            type=t.type.value,
            reason=t.reason,
            admin_id=t.admin_id,
            admin_name=t.admin.name if t.admin else None,
            template_id=t.template_id,
            template_name=t.template.name if t.template else None,
            created_at=t.created_at,
        )
        for t in txs
    ]
