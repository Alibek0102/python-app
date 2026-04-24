from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "USER"
    coin_balance: int = 0


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=6)
    role: Optional[str] = None
    coin_balance: Optional[int] = None


class AdminUserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    coin_balance: int

    class Config:
        from_attributes = True


class AdminApplyTemplateIn(BaseModel):
    template_id: int
