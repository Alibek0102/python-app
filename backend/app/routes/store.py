from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_db
from app.models.models import Product
from app.schemas.order import OrderCreate, OrderOut
from app.routes.auth import get_current_user
from app.services.store_service import create_order

router = APIRouter(tags=["store"])


@router.get("/products")
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).where(Product.is_active == True, Product.stock > 0)
    )
    products = result.scalars().all()
    return products


@router.post("/orders", response_model=OrderOut)
async def place_order(
    order: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        new_order = await create_order(db, current_user.id, order.product_id)
        return new_order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))