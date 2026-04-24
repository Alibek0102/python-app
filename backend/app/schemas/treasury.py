from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TreasuryOut(BaseModel):
    balance: int


class TreasuryIssueIn(BaseModel):
    amount: int = Field(gt=0)
    note: Optional[str] = None


class TreasuryOperationOut(BaseModel):
    id: int
    amount: int
    note: Optional[str] = None
    performed_by_id: Optional[int] = None
    performed_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
