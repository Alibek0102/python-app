from datetime import datetime
from pydantic import BaseModel


class TransactionOut(BaseModel):
    id: int
    user_id: int
    amount: int
    type: str
    reason: str | None
    created_at: datetime

    class Config:
        from_attributes = True