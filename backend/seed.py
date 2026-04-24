import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import engine, AsyncSessionLocal
from app.models.models import User, Product, UserRole
from app.core.security import get_password_hash


async def seed():
    async with AsyncSessionLocal() as session:
        async with session.begin():
            from sqlalchemy import select

            result = await session.execute(select(User).where(User.email == "admin@company.com"))
            if not result.scalar_one_or_none():
                admin = User(
                    name="Admin",
                    email="admin@company.com",
                    password_hash=get_password_hash("admin123"),
                    role=UserRole.ADMIN,
                    coin_balance=9999,
                )
                session.add(admin)

            result = await session.execute(select(User).where(User.email == "user@company.com"))
            if not result.scalar_one_or_none():
                user = User(
                    name="User",
                    email="user@company.com",
                    password_hash=get_password_hash("user123"),
                    role=UserRole.USER,
                    coin_balance=150,
                )
                session.add(user)

            products_data = [
                {"name": "Umbrella", "description": "Corporate branded umbrella", "coin_price": 120, "stock": 3, "image_url": "https://placehold.co/400x300?text=Umbrella"},
                {"name": "Notebook", "description": "Premium notebook with logo", "coin_price": 80, "stock": 5, "image_url": "https://placehold.co/400x300?text=Notebook"},
                {"name": "Pen", "description": "Ballpoint pen with company branding", "coin_price": 30, "stock": 10, "image_url": "https://placehold.co/400x300?text=Pen"},
                {"name": "Cap", "description": "Adjustable cap with embroidered logo", "coin_price": 100, "stock": 2, "image_url": "https://placehold.co/400x300?text=Cap"},
            ]

            for data in products_data:
                result = await session.execute(select(Product).where(Product.name == data["name"]))
                if not result.scalar_one_or_none():
                    session.add(Product(**data))

        await session.commit()

    print("Seed completed.")


if __name__ == "__main__":
    asyncio.run(seed())