from typing import Optional
from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    coin_price: int
    stock: int
    image_url: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    coin_price: Optional[int] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True