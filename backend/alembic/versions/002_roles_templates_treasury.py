"""Roles, templates, treasury

Revision ID: 002
Revises: 001
Create Date: 2026-04-24 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add SUPERADMIN value to userrole enum (must run outside a transaction block)
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SUPERADMIN'")

    coin_template_type = postgresql.ENUM(
        "AWARD", "PENALTY", name="cointemplatetype", create_type=False
    )
    coin_template_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "coin_templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("type", coin_template_type, nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("amount > 0", name="ck_coin_templates_amount_positive"),
    )
    op.create_index("ix_coin_templates_id", "coin_templates", ["id"])

    op.create_table(
        "treasury",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("balance", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.execute(
        "INSERT INTO treasury (id, balance, updated_at) "
        "VALUES (1, 0, NOW()) ON CONFLICT (id) DO NOTHING"
    )

    op.create_table(
        "treasury_operations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("note", sa.String(), nullable=True),
        sa.Column("performed_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["performed_by_id"], ["users.id"]),
    )
    op.create_index("ix_treasury_operations_id", "treasury_operations", ["id"])

    op.add_column(
        "transactions",
        sa.Column("admin_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "transactions",
        sa.Column("template_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_transactions_admin_id_users",
        "transactions",
        "users",
        ["admin_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_transactions_template_id_coin_templates",
        "transactions",
        "coin_templates",
        ["template_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_transactions_template_id_coin_templates", "transactions", type_="foreignkey")
    op.drop_constraint("fk_transactions_admin_id_users", "transactions", type_="foreignkey")
    op.drop_column("transactions", "template_id")
    op.drop_column("transactions", "admin_id")
    op.drop_index("ix_treasury_operations_id", table_name="treasury_operations")
    op.drop_table("treasury_operations")
    op.drop_table("treasury")
    op.drop_index("ix_coin_templates_id", table_name="coin_templates")
    op.drop_table("coin_templates")
    postgresql.ENUM(name="cointemplatetype").drop(op.get_bind(), checkfirst=True)
