from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.models import User, Product, Order, Transaction, TransactionType, Treasury
from app.services.coin_service import TREASURY_ID


async def create_order(db: AsyncSession, user_id: int, product_id: int):
    try:
        result = await db.execute(
            select(Product).where(Product.id == product_id).with_for_update()
        )
        product = result.scalar_one_or_none()
        if not product:
            raise ValueError("Product not found")
        if not product.is_active:
            raise ValueError("Product is not active")
        if product.stock <= 0:
            raise ValueError("Product is out of stock")

        result = await db.execute(
            select(User).where(User.id == user_id).with_for_update()
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")
        if user.coin_balance < product.coin_price:
            raise ValueError("Insufficient coins")

        treasury_result = await db.execute(
            select(Treasury).where(Treasury.id == TREASURY_ID).with_for_update()
        )
        treasury = treasury_result.scalar_one_or_none()
        if treasury is None:
            treasury = Treasury(id=TREASURY_ID, balance=0)
            db.add(treasury)
            await db.flush()

        user.coin_balance -= product.coin_price
        product.stock -= 1
        treasury.balance += product.coin_price
        treasury.updated_at = datetime.now(timezone.utc)

        order = Order(user_id=user_id, product_id=product_id, status="COMPLETED")
        db.add(order)

        transaction = Transaction(
            user_id=user_id,
            amount=product.coin_price,
            type=TransactionType.SPENT,
            reason=f"Purchased {product.name}",
        )
        db.add(transaction)

        await db.commit()
    except Exception:
        await db.rollback()
        raise

    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.product))
    )
    return result.scalar_one()
