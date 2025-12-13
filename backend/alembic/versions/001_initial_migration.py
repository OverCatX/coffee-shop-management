"""Initial migration

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create employees table
    op.create_table(
        "employees",
        sa.Column("emp_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("salary", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("hire_date", sa.Date(), nullable=False),
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
        sa.CheckConstraint("salary > 0", name="check_salary_positive"),
        sa.PrimaryKeyConstraint("emp_id"),
    )
    op.create_index(op.f("ix_employees_emp_id"), "employees", ["emp_id"], unique=False)
    op.create_index(op.f("ix_employees_email"), "employees", ["email"], unique=True)
    op.create_index(op.f("ix_employees_phone"), "employees", ["phone"], unique=True)

    # Create managers table
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

    # Create baristas table
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

    # Create customers table
    op.create_table(
        "customers",
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=100), nullable=True),
        sa.Column("loyalty_points", sa.Numeric(precision=10, scale=2), nullable=False),
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
        sa.PrimaryKeyConstraint("customer_id"),
    )
    op.create_index(
        op.f("ix_customers_customer_id"), "customers", ["customer_id"], unique=False
    )
    op.create_index(op.f("ix_customers_phone"), "customers", ["phone"], unique=True)
    op.create_index(op.f("ix_customers_email"), "customers", ["email"], unique=True)
    op.create_index(
        "idx_customer_phone_email", "customers", ["phone", "email"], unique=False
    )

    # Create ingredients table
    op.create_table(
        "ingredients",
        sa.Column("ingredient_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("unit", sa.String(length=20), nullable=False),
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
        sa.PrimaryKeyConstraint("ingredient_id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(
        op.f("ix_ingredients_ingredient_id"),
        "ingredients",
        ["ingredient_id"],
        unique=False,
    )
    op.create_index(op.f("ix_ingredients_name"), "ingredients", ["name"], unique=True)

    # Create menu_items table
    op.create_table(
        "menu_items",
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("is_available", sa.Boolean(), nullable=False),
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
        sa.CheckConstraint("price > 0", name="check_price_positive"),
        sa.PrimaryKeyConstraint("item_id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(
        op.f("ix_menu_items_item_id"), "menu_items", ["item_id"], unique=False
    )
    op.create_index(op.f("ix_menu_items_name"), "menu_items", ["name"], unique=True)
    op.create_index(
        op.f("ix_menu_items_category"), "menu_items", ["category"], unique=False
    )
    op.create_index(
        op.f("ix_menu_items_is_available"), "menu_items", ["is_available"], unique=False
    )
    op.create_index(
        "idx_menu_item_category_available",
        "menu_items",
        ["category", "is_available"],
        unique=False,
    )

    # Create inventory table
    op.create_table(
        "inventory",
        sa.Column("inventory_id", sa.Integer(), nullable=False),
        sa.Column("ingredient_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("min_threshold", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=True),
        sa.Column(
            "last_updated",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
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
        sa.CheckConstraint("quantity >= 0", name="check_quantity_non_negative"),
        sa.CheckConstraint("min_threshold >= 0", name="check_threshold_non_negative"),
        sa.ForeignKeyConstraint(
            ["employee_id"], ["employees.emp_id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["ingredient_id"], ["ingredients.ingredient_id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("inventory_id"),
    )
    op.create_index(
        op.f("ix_inventory_inventory_id"), "inventory", ["inventory_id"], unique=False
    )
    op.create_index(
        op.f("ix_inventory_ingredient_id"), "inventory", ["ingredient_id"], unique=False
    )
    op.create_index(
        op.f("ix_inventory_employee_id"), "inventory", ["employee_id"], unique=False
    )
    op.create_index(
        "idx_inventory_ingredient_quantity",
        "inventory",
        ["ingredient_id", "quantity"],
        unique=False,
    )

    # Create orders table
    op.create_table(
        "orders",
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=True),
        sa.Column("order_date", sa.Date(), nullable=False),
        sa.Column("total_amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
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
            "status IN ('pending', 'completed', 'cancelled')", name="check_order_status"
        ),
        sa.CheckConstraint("total_amount >= 0", name="check_total_amount_non_negative"),
        sa.ForeignKeyConstraint(
            ["customer_id"], ["customers.customer_id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("order_id"),
    )
    op.create_index(op.f("ix_orders_order_id"), "orders", ["order_id"], unique=False)
    op.create_index(
        op.f("ix_orders_customer_id"), "orders", ["customer_id"], unique=False
    )
    op.create_index(
        op.f("ix_orders_order_date"), "orders", ["order_date"], unique=False
    )
    op.create_index(op.f("ix_orders_status"), "orders", ["status"], unique=False)
    op.create_index(
        "idx_order_date_status", "orders", ["order_date", "status"], unique=False
    )
    op.create_index(
        "idx_order_customer_date", "orders", ["customer_id", "order_date"], unique=False
    )

    # Create order_details table
    op.create_table(
        "order_details",
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("subtotal", sa.Numeric(precision=10, scale=2), nullable=False),
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
        sa.CheckConstraint("quantity > 0", name="check_quantity_positive"),
        sa.CheckConstraint("subtotal >= 0", name="check_subtotal_non_negative"),
        sa.CheckConstraint("unit_price >= 0", name="check_unit_price_non_negative"),
        sa.ForeignKeyConstraint(
            ["item_id"], ["menu_items.item_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["order_id"], ["orders.order_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("order_id", "item_id"),
    )
    op.create_index(
        op.f("ix_order_details_order_id"), "order_details", ["order_id"], unique=False
    )
    op.create_index(
        op.f("ix_order_details_item_id"), "order_details", ["item_id"], unique=False
    )

    # Create payments table
    op.create_table(
        "payments",
        sa.Column("payment_id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("payment_method", sa.String(length=50), nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column(
            "payment_date",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
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
        sa.CheckConstraint("amount > 0", name="check_payment_amount_positive"),
        sa.CheckConstraint(
            "status IN ('pending', 'completed', 'failed')", name="check_payment_status"
        ),
        sa.ForeignKeyConstraint(["order_id"], ["orders.order_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("payment_id"),
    )
    op.create_index(
        op.f("ix_payments_payment_id"), "payments", ["payment_id"], unique=False
    )
    op.create_index(
        op.f("ix_payments_order_id"), "payments", ["order_id"], unique=False
    )
    op.create_index(op.f("ix_payments_status"), "payments", ["status"], unique=False)
    op.create_index(
        op.f("ix_payments_payment_date"), "payments", ["payment_date"], unique=False
    )
    op.create_index(
        "idx_payment_order_status", "payments", ["order_id", "status"], unique=False
    )
    op.create_index(
        "idx_payment_date_status", "payments", ["payment_date", "status"], unique=False
    )

    # Create barista_menu_items junction table
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

    # Create menu_item_ingredients junction table
    op.create_table(
        "menu_item_ingredients",
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("ingredient_id", sa.Integer(), nullable=False),
        sa.Column("amount_required", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("unit", sa.String(length=20), nullable=False),
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
            "amount_required > 0", name="check_amount_required_positive"
        ),
        sa.ForeignKeyConstraint(
            ["ingredient_id"], ["ingredients.ingredient_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["item_id"], ["menu_items.item_id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("item_id", "ingredient_id"),
    )
    op.create_index(
        op.f("ix_menu_item_ingredients_item_id"),
        "menu_item_ingredients",
        ["item_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_menu_item_ingredients_ingredient_id"),
        "menu_item_ingredients",
        ["ingredient_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table("menu_item_ingredients")
    op.drop_table("barista_menu_items")
    op.drop_table("payments")
    op.drop_table("order_details")
    op.drop_table("orders")
    op.drop_table("inventory")
    op.drop_table("menu_items")
    op.drop_table("ingredients")
    op.drop_table("customers")
    op.drop_table("baristas")
    op.drop_table("managers")
    op.drop_table("employees")
