from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.models import (
    User,
    Transaction,
    TransactionType,
    CoinTemplate,
    CoinTemplateType,
    Treasury,
    TreasuryOperation,
)


TREASURY_ID = 1


async def _lock_treasury(db: AsyncSession) -> Treasury:
    result = await db.execute(
        select(Treasury).where(Treasury.id == TREASURY_ID).with_for_update()
    )
    treasury = result.scalar_one_or_none()
    if treasury is None:
        treasury = Treasury(id=TREASURY_ID, balance=0)
        db.add(treasury)
        await db.flush()
    return treasury


async def issue_to_treasury(db: AsyncSession, performed_by: User, amount: int, note: str | None) -> Treasury:
    if amount <= 0:
        raise ValueError("amount must be positive")
    try:
        treasury = await _lock_treasury(db)
        treasury.balance += amount
        treasury.updated_at = datetime.now(timezone.utc)
        op = TreasuryOperation(
            amount=amount,
            note=note,
            performed_by_id=performed_by.id,
        )
        db.add(op)
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    await db.refresh(treasury)
    return treasury


async def apply_template(
    db: AsyncSession, admin: User, user_id: int, template_id: int
) -> Transaction:
    try:
        tpl_result = await db.execute(
            select(CoinTemplate).where(CoinTemplate.id == template_id)
        )
        template = tpl_result.scalar_one_or_none()
        if template is None:
            raise ValueError("Template not found")
        if not template.is_active:
            raise ValueError("Template is inactive")

        user_result = await db.execute(
            select(User).where(User.id == user_id).with_for_update()
        )
        target = user_result.scalar_one_or_none()
        if target is None:
            raise ValueError("User not found")

        treasury = await _lock_treasury(db)

        if template.type == CoinTemplateType.AWARD:
            if treasury.balance < template.amount:
                raise ValueError("Insufficient treasury balance")
            treasury.balance -= template.amount
            target.coin_balance += template.amount
            tx_type = TransactionType.EARNED
        elif template.type == CoinTemplateType.PENALTY:
            if target.coin_balance < template.amount:
                raise ValueError("Insufficient user balance")
            target.coin_balance -= template.amount
            treasury.balance += template.amount
            tx_type = TransactionType.SPENT
        else:
            raise ValueError("Unknown template type")

        treasury.updated_at = datetime.now(timezone.utc)
        tx = Transaction(
            user_id=target.id,
            amount=template.amount,
            type=tx_type,
            reason=template.name,
            admin_id=admin.id,
            template_id=template.id,
        )
        db.add(tx)

        await db.commit()
    except Exception:
        await db.rollback()
        raise

    result = await db.execute(select(Transaction).where(Transaction.id == tx.id))
    return result.scalar_one()
