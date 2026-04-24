from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.models.models import User, Order
from app.routes.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/profile")
async def get_profile(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    result = await db.execute(
        select(User)
        .where(User.id == current_user.id)
        .options(selectinload(User.orders).selectinload(Order.product))
        .options(selectinload(User.transactions))
    )
    user = result.scalar_one()
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "coin_balance": user.coin_balance,
        "created_at": user.created_at.isoformat(),
        "orders": [
            {
                "id": o.id,
                "product_id": o.product_id,
                "product_name": o.product.name if o.product else None,
                "status": o.status,
                "created_at": o.created_at.isoformat(),
            }
            for o in user.orders
        ],
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "type": t.type.value,
                "reason": t.reason,
                "created_at": t.created_at.isoformat(),
            }
            for t in user.transactions
        ],
    }