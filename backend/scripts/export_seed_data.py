#!/usr/bin/env python3
"""
Script to export data from PostgreSQL database to SQL seed data file
This script reads all data from the database and generates SQL INSERT statements
"""

import sys
from pathlib import Path
from datetime import datetime, date
from decimal import Decimal

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.employee import Employee
from app.models.customer import Customer
from app.models.menu_item import MenuItem
from app.models.ingredient import Ingredient
from app.models.inventory import Inventory
from app.models.order import Order, OrderDetail
from app.models.payment import Payment
from app.models.junction_tables import MenuItemIngredient


def escape_sql_string(value):
    """Escape SQL string values"""
    if value is None:
        return "NULL"
    if isinstance(value, str):
        # Escape single quotes by doubling them
        return f"'{value.replace("'", "''")}'"
    if isinstance(value, (date, datetime)):
        return f"'{value}'"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, Decimal):
        return str(value)
    return str(value)


def generate_insert_sql(table_name, columns, rows):
    """Generate SQL INSERT statements"""
    if not rows:
        return f"-- No data in {table_name}\n"

    sql_lines = [f"-- Insert {table_name}"]
    sql_lines.append(f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES")

    values_list = []
    for row in rows:
        values = [escape_sql_string(row.get(col)) for col in columns]
        values_list.append(f"    ({', '.join(values)})")

    sql_lines.append(",\n".join(values_list))
    sql_lines.append("ON CONFLICT DO NOTHING;")
    sql_lines.append("")

    return "\n".join(sql_lines)


def export_employees(db: Session):
    """Export employees data"""
    employees = db.query(Employee).filter(Employee.is_deleted == False).all()

    columns = [
        "emp_id",
        "name",
        "role",
        "salary",
        "email",
        "phone",
        "hire_date",
        "password_hash",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for emp in employees:
        rows.append(
            {
                "emp_id": emp.emp_id,
                "name": emp.name,
                "role": emp.role,
                "salary": float(emp.salary),
                "email": emp.email,
                "phone": emp.phone,
                "hire_date": emp.hire_date,
                "password_hash": emp.password_hash,
                "created_at": emp.created_at,
                "updated_at": emp.updated_at,
                "is_deleted": emp.is_deleted,
            }
        )

    return generate_insert_sql("employees", columns, rows)


def export_customers(db: Session):
    """Export customers data"""
    customers = db.query(Customer).filter(Customer.is_deleted == False).all()

    columns = [
        "customer_id",
        "name",
        "phone",
        "email",
        "loyalty_points",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for cust in customers:
        rows.append(
            {
                "customer_id": cust.customer_id,
                "name": cust.name,
                "phone": cust.phone,
                "email": cust.email,
                "loyalty_points": float(cust.loyalty_points),
                "created_at": cust.created_at,
                "updated_at": cust.updated_at,
                "is_deleted": cust.is_deleted,
            }
        )

    return generate_insert_sql("customers", columns, rows)


def export_ingredients(db: Session):
    """Export ingredients data"""
    ingredients = db.query(Ingredient).filter(Ingredient.is_deleted == False).all()

    columns = [
        "ingredient_id",
        "name",
        "unit",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for ing in ingredients:
        rows.append(
            {
                "ingredient_id": ing.ingredient_id,
                "name": ing.name,
                "unit": ing.unit,
                "created_at": ing.created_at,
                "updated_at": ing.updated_at,
                "is_deleted": ing.is_deleted,
            }
        )

    return generate_insert_sql("ingredients", columns, rows)


def export_menu_items(db: Session):
    """Export menu items data"""
    menu_items = db.query(MenuItem).filter(MenuItem.is_deleted == False).all()

    columns = [
        "item_id",
        "name",
        "price",
        "category",
        "description",
        "image_url",
        "is_available",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for item in menu_items:
        rows.append(
            {
                "item_id": item.item_id,
                "name": item.name,
                "price": float(item.price),
                "category": item.category,
                "description": item.description,
                "image_url": item.image_url,
                "is_available": item.is_available,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
                "is_deleted": item.is_deleted,
            }
        )

    return generate_insert_sql("menu_items", columns, rows)


def export_menu_item_ingredients(db: Session):
    """Export menu_item_ingredients data"""
    menu_item_ingredients = (
        db.query(MenuItemIngredient)
        .filter(MenuItemIngredient.is_deleted == False)
        .all()
    )

    columns = [
        "item_id",
        "ingredient_id",
        "amount_required",
        "unit",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for mii in menu_item_ingredients:
        rows.append(
            {
                "item_id": mii.item_id,
                "ingredient_id": mii.ingredient_id,
                "amount_required": float(mii.amount_required),
                "unit": mii.unit,
                "created_at": mii.created_at,
                "updated_at": mii.updated_at,
                "is_deleted": mii.is_deleted,
            }
        )

    return generate_insert_sql("menu_item_ingredients", columns, rows)


def export_inventory(db: Session):
    """Export inventory data"""
    inventory = db.query(Inventory).filter(Inventory.is_deleted == False).all()

    columns = [
        "inventory_id",
        "ingredient_id",
        "quantity",
        "min_threshold",
        "employee_id",
        "last_updated",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for inv in inventory:
        rows.append(
            {
                "inventory_id": inv.inventory_id,
                "ingredient_id": inv.ingredient_id,
                "quantity": float(inv.quantity),
                "min_threshold": float(inv.min_threshold),
                "employee_id": inv.employee_id,
                "last_updated": inv.last_updated,
                "created_at": inv.created_at,
                "updated_at": inv.updated_at,
                "is_deleted": inv.is_deleted,
            }
        )

    return generate_insert_sql("inventory", columns, rows)


def export_orders(db: Session):
    """Export orders data"""
    orders = db.query(Order).filter(Order.is_deleted == False).all()

    columns = [
        "order_id",
        "customer_id",
        "order_date",
        "total_amount",
        "status",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for order in orders:
        rows.append(
            {
                "order_id": order.order_id,
                "customer_id": order.customer_id,
                "order_date": order.order_date,
                "total_amount": float(order.total_amount),
                "status": order.status,
                "created_at": order.created_at,
                "updated_at": order.updated_at,
                "is_deleted": order.is_deleted,
            }
        )

    return generate_insert_sql("orders", columns, rows)


def export_order_details(db: Session):
    """Export order_details data"""
    order_details = db.query(OrderDetail).filter(OrderDetail.is_deleted == False).all()

    columns = [
        "order_id",
        "item_id",
        "quantity",
        "unit_price",
        "subtotal",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for od in order_details:
        rows.append(
            {
                "order_id": od.order_id,
                "item_id": od.item_id,
                "quantity": od.quantity,
                "unit_price": float(od.unit_price),
                "subtotal": float(od.subtotal),
                "created_at": od.created_at,
                "updated_at": od.updated_at,
                "is_deleted": od.is_deleted,
            }
        )

    return generate_insert_sql("order_details", columns, rows)


def export_payments(db: Session):
    """Export payments data"""
    payments = db.query(Payment).filter(Payment.is_deleted == False).all()

    columns = [
        "payment_id",
        "order_id",
        "payment_method",
        "amount",
        "status",
        "payment_date",
        "created_at",
        "updated_at",
        "is_deleted",
    ]
    rows = []

    for payment in payments:
        rows.append(
            {
                "payment_id": payment.payment_id,
                "order_id": payment.order_id,
                "payment_method": payment.payment_method,
                "amount": float(payment.amount),
                "status": payment.status,
                "payment_date": payment.payment_date,
                "created_at": payment.created_at,
                "updated_at": payment.updated_at,
                "is_deleted": payment.is_deleted,
            }
        )

    return generate_insert_sql("payments", columns, rows)


def main():
    """Main function to export all data"""
    print("=" * 60)
    print("Exporting database data to SQL seed file...")
    print("=" * 60)

    db: Session = SessionLocal()

    try:
        # Generate SQL content
        sql_content = []
        sql_content.append("-- Exported Seed Data from PostgreSQL Database")
        sql_content.append(
            f"-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )
        sql_content.append("-- This file contains all data from the database")
        sql_content.append("-- Use this file to seed a new database with the same data")
        sql_content.append("")
        sql_content.append(
            "-- Note: Make sure to run schema, constraints, and indexes first"
        )
        sql_content.append("-- Order matters due to foreign key constraints")
        sql_content.append("")
        sql_content.append("-- Disable foreign key checks temporarily (if needed)")
        sql_content.append("-- SET session_replication_role = 'replica';")
        sql_content.append("")

        # Export in order of dependencies
        print("Exporting employees...")
        sql_content.append(export_employees(db))

        print("Exporting customers...")
        sql_content.append(export_customers(db))

        print("Exporting ingredients...")
        sql_content.append(export_ingredients(db))

        print("Exporting menu items...")
        sql_content.append(export_menu_items(db))

        print("Exporting menu_item_ingredients...")
        sql_content.append(export_menu_item_ingredients(db))

        print("Exporting inventory...")
        sql_content.append(export_inventory(db))

        print("Exporting orders...")
        sql_content.append(export_orders(db))

        print("Exporting order_details...")
        sql_content.append(export_order_details(db))

        print("Exporting payments...")
        sql_content.append(export_payments(db))

        sql_content.append("-- Re-enable foreign key checks")
        sql_content.append("-- SET session_replication_role = 'origin';")
        sql_content.append("")
        sql_content.append("-- Export completed!")

        # Write to file
        output_file = (
            Path(__file__).parent.parent / "database" / "07_exported_seed_data.sql"
        )
        output_file.write_text("\n".join(sql_content), encoding="utf-8")

        print("=" * 60)
        print(f"✅ Data exported successfully to: {output_file}")
        print("=" * 60)
        print(f"\nFile size: {output_file.stat().st_size} bytes")
        print(f"Total lines: {len(sql_content)}")

    except Exception as e:
        print(f"\n❌ Error exporting data: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
