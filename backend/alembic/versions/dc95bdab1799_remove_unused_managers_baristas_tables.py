"""remove_unused_managers_baristas_tables

Revision ID: dc95bdab1799
Revises: a286023a80f1
Create Date: 2025-12-14 16:26:58.352748

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dc95bdab1799'
down_revision: Union[str, None] = 'a286023a80f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop barista_menu_items table first (has foreign key to baristas)
    op.drop_table("barista_menu_items")
    
    # Drop baristas table
    op.drop_table("baristas")
    
    # Drop managers table
    op.drop_table("managers")


def downgrade() -> None:
    # Recreate managers table
    op.create_table(
        "managers",
        sa.Column("emp_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["emp_id"], ["employees.emp_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("emp_id"),
    )
    op.create_index(op.f("ix_managers_emp_id"), "managers", ["emp_id"], unique=False)
    
    # Recreate baristas table
    op.create_table(
        "baristas",
        sa.Column("emp_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["emp_id"], ["employees.emp_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("emp_id"),
    )
    op.create_index(op.f("ix_baristas_emp_id"), "baristas", ["emp_id"], unique=False)
    
    # Recreate barista_menu_items table
    op.create_table(
        "barista_menu_items",
        sa.Column("barista_id", sa.Integer(), nullable=False),
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("proficiency_level", sa.String(length=20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.CheckConstraint(
            "proficiency_level IN ('basic', 'intermediate', 'advanced')",
            name="check_proficiency_level",
        ),
        sa.ForeignKeyConstraint(
            ["barista_id"], ["baristas.emp_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["item_id"], ["menu_items.item_id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("barista_id", "item_id"),
    )
    op.create_index(
        op.f("ix_barista_menu_items_barista_id"),
        "barista_menu_items",
        ["barista_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_barista_menu_items_item_id"),
        "barista_menu_items",
        ["item_id"],
        unique=False,
    )

