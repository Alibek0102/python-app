from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class TransactionOut(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    amount: int
    type: str
    reason: Optional[str] = None
    admin_id: Optional[int] = None
    admin_name: Optional[str] = None
    template_id: Optional[int] = None
    template_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
