from datetime import datetime
from pydantic import BaseModel


class OrderCreate(BaseModel):
    product_id: int


class OrderOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True