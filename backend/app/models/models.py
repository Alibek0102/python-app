import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import relationship

from app.db import Base


class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class TransactionType(str, enum.Enum):
    EARNED = "EARNED"
    SPENT = "SPENT"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    coin_balance = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    orders = relationship("Order", back_populates="user", lazy="selectin")
    transactions = relationship("Transaction", back_populates="user", lazy="selectin")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    coin_price = Column(Integer, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    orders = relationship("Order", back_populates="product", lazy="selectin")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    status = Column(String, default="COMPLETED", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="transactions")