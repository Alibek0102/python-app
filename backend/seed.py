import asyncio
from sqlalchemy import select

from app.db import AsyncSessionLocal
from app.models.models import (
    User,
    Product,
    UserRole,
    CoinTemplate,
    CoinTemplateType,
    Treasury,
)
from app.core.security import get_password_hash


async def seed():
    async with AsyncSessionLocal() as session:
        async with session.begin():
            result = await session.execute(select(User).where(User.email == "superadmin@company.com"))
            if not result.scalar_one_or_none():
                session.add(User(
                    name="SuperAdmin",
                    email="superadmin@company.com",
                    password_hash=get_password_hash("super123"),
                    role=UserRole.SUPERADMIN,
                    coin_balance=0,
                ))

            result = await session.execute(select(User).where(User.email == "admin@company.com"))
            if not result.scalar_one_or_none():
                session.add(User(
                    name="Admin",
                    email="admin@company.com",
                    password_hash=get_password_hash("admin123"),
                    role=UserRole.ADMIN,
                    coin_balance=9999,
                ))

            result = await session.execute(select(User).where(User.email == "user@company.com"))
            if not result.scalar_one_or_none():
                session.add(User(
                    name="User",
                    email="user@company.com",
                    password_hash=get_password_hash("user123"),
                    role=UserRole.USER,
                    coin_balance=150,
                ))

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

            templates_data = [
                {"name": "Good work", "type": CoinTemplateType.AWARD, "amount": 50, "description": "Recognition for solid work"},
                {"name": "Outstanding contribution", "type": CoinTemplateType.AWARD, "amount": 200, "description": "Exceptional impact"},
                {"name": "Late arrival", "type": CoinTemplateType.PENALTY, "amount": 20, "description": "Being late to work"},
                {"name": "Missed deadline", "type": CoinTemplateType.PENALTY, "amount": 50, "description": "Did not meet a committed deadline"},
            ]
            for data in templates_data:
                result = await session.execute(
                    select(CoinTemplate).where(CoinTemplate.name == data["name"])
                )
                if not result.scalar_one_or_none():
                    session.add(CoinTemplate(**data))

            result = await session.execute(select(Treasury).where(Treasury.id == 1))
            if not result.scalar_one_or_none():
                session.add(Treasury(id=1, balance=0))

        await session.commit()

    print("Seed completed.")


if __name__ == "__main__":
    asyncio.run(seed())
