from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.models import User, Product, Order, Transaction, TransactionType


async def create_order(db: AsyncSession, user_id: int, product_id: int):
    async with db.begin():
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

        user.coin_balance -= product.coin_price
        product.stock -= 1

        order = Order(user_id=user_id, product_id=product_id, status="COMPLETED")
        db.add(order)

        transaction = Transaction(
            user_id=user_id,
            amount=product.coin_price,
            type=TransactionType.SPENT,
            reason=f"Purchased {product.name}",
        )
        db.add(transaction)

        await db.flush()
        await db.refresh(order)
        await db.refresh(user)
        await db.refresh(product)

    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.product))
    )
    return result.scalar_one()