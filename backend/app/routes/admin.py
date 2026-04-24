from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.models.models import User, Product, Order
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.routes.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(current_user=Depends(get_current_user)):
    if not current_user or current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/products")
async def admin_get_products(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products


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