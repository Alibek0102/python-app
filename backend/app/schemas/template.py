from typing import Optional
from pydantic import BaseModel, Field


class CoinTemplateBase(BaseModel):
    name: str
    type: str  # "AWARD" | "PENALTY"
    amount: int = Field(gt=0)
    description: Optional[str] = None
    is_active: bool = True


class CoinTemplateCreate(CoinTemplateBase):
    pass


class CoinTemplateUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    amount: Optional[int] = Field(default=None, gt=0)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CoinTemplateOut(CoinTemplateBase):
    id: int

    class Config:
        from_attributes = True
