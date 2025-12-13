#!/usr/bin/env python3
"""
Script to seed database with mock data from frontend
This script reads mock data and inserts it into the database with proper password hashing
"""

import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.employee import Employee
from app.models.customer import Customer
from app.models.menu_item import MenuItem
from app.models.inventory import Inventory
from app.models.ingredient import Ingredient
from app.models.order import Order, OrderDetail
from datetime import datetime, date

# Mock data from frontend (converted to Python format)
MOCK_EMPLOYEES = [
    {
        "name": "John Smith",
        "role": "Manager",
        "salary": 35000.00,
        "email": "john.smith@coffeeshop.com",
        "phone": "081-234-5678",
        "hire_date": date(2023, 1, 15),
        "password": "password123",  # Will be hashed
    },
    {
        "name": "Sarah Johnson",
        "role": "Barista",
        "salary": 25000.00,
        "email": "sarah.j@coffeeshop.com",
        "phone": "082-345-6789",
        "hire_date": date(2023, 3, 20),
        "password": "password123",
    },
    {
        "name": "Mike Chen",
        "role": "Barista",
        "salary": 25000.00,
        "email": "mike.chen@coffeeshop.com",
        "phone": "083-456-7890",
        "hire_date": date(2023, 5, 10),
        "password": "password123",
    },
    {
        "name": "Emma Wilson",
        "role": "Cashier",
        "salary": 22000.00,
        "email": "emma.w@coffeeshop.com",
        "phone": "084-567-8901",
        "hire_date": date(2023, 7, 1),
        "password": "password123",
    },
]

MOCK_CUSTOMERS = [
    {
        "name": "Alice Brown",
        "phone": "085-111-2222",
        "email": "alice.brown@email.com",
        "loyalty_points": 150.00,
    },
    {
        "name": "Bob Davis",
        "phone": "086-222-3333",
        "email": "bob.davis@email.com",
        "loyalty_points": 320.00,
    },
    {
        "name": "Carol White",
        "phone": "087-333-4444",
        "email": "carol.white@email.com",
        "loyalty_points": 75.00,
    },
    {
        "name": "David Lee",
        "phone": "088-444-5555",
        "email": None,
        "loyalty_points": 500.00,
    },
]

MOCK_MENU_ITEMS = [
    {
        "name": "Espresso",
        "price": 60.00,
        "category": "Coffee",
        "description": "Rich and bold espresso shot",
        "is_available": True,
    },
    {
        "name": "Cappuccino",
        "price": 80.00,
        "category": "Coffee",
        "description": "Espresso with steamed milk and foam",
        "is_available": True,
    },
    {
        "name": "Latte",
        "price": 85.00,
        "category": "Coffee",
        "description": "Smooth espresso with steamed milk",
        "is_available": True,
    },
    {
        "name": "Americano",
        "price": 70.00,
        "category": "Coffee",
        "description": "Espresso with hot water",
        "is_available": True,
    },
    {
        "name": "Mocha",
        "price": 95.00,
        "category": "Coffee",
        "description": "Chocolate espresso with steamed milk",
        "is_available": True,
    },
    {
        "name": "Green Tea",
        "price": 65.00,
        "category": "Non-Coffee",
        "description": "Refreshing green tea",
        "is_available": True,
    },
    {
        "name": "Matcha Latte",
        "price": 90.00,
        "category": "Non-Coffee",
        "description": "Creamy matcha with steamed milk",
        "is_available": True,
    },
    {
        "name": "Chocolate Cake",
        "price": 120.00,
        "category": "Bakery",
        "description": "Rich chocolate cake slice",
        "is_available": True,
    },
    {
        "name": "Croissant",
        "price": 55.00,
        "category": "Bakery",
        "description": "Buttery French croissant",
        "is_available": True,
    },
    {
        "name": "Blueberry Muffin",
        "price": 65.00,
        "category": "Bakery",
        "description": "Fresh blueberry muffin",
        "is_available": False,
    },
]

MOCK_INGREDIENTS = [
    {"name": "Coffee Beans", "unit": "kg"},
    {"name": "Milk", "unit": "liter"},
    {"name": "Sugar", "unit": "kg"},
    {"name": "Vanilla Syrup", "unit": "liter"},
    {"name": "Chocolate Syrup", "unit": "liter"},
]

MOCK_INVENTORY = [
    {"ingredient_name": "Coffee Beans", "quantity": 50.5, "min_threshold": 20.0},
    {"ingredient_name": "Milk", "quantity": 15.0, "min_threshold": 20.0},
    {"ingredient_name": "Sugar", "quantity": 100.0, "min_threshold": 30.0},
    {"ingredient_name": "Vanilla Syrup", "quantity": 8.5, "min_threshold": 10.0},
    {"ingredient_name": "Chocolate Syrup", "quantity": 200.0, "min_threshold": 50.0},
]


def seed_employees(db: Session):
    """Seed employees with hashed passwords"""
    print("Seeding employees...")
    employee_map = {}
    
    for emp_data in MOCK_EMPLOYEES:
        # Check if employee already exists
        existing = db.query(Employee).filter(Employee.email == emp_data["email"]).first()
        if existing:
            print(f"  Employee {emp_data['email']} already exists, skipping...")
            employee_map[emp_data["email"]] = existing
            continue
        
        # Hash password
        password_hash = get_password_hash(emp_data["password"])
        
        # Create employee
        employee = Employee(
            name=emp_data["name"],
            role=emp_data["role"],
            salary=emp_data["salary"],
            email=emp_data["email"],
            phone=emp_data["phone"],
            hire_date=emp_data["hire_date"],
            password_hash=password_hash,
        )
        db.add(employee)
        db.flush()  # Get the emp_id
        
        employee_map[emp_data["email"]] = employee
        
        print(f"  Created employee: {emp_data['name']} ({emp_data['role']})")
    
    db.commit()
    return employee_map


def seed_customers(db: Session):
    """Seed customers"""
    print("Seeding customers...")
    customer_map = {}
    
    for cust_data in MOCK_CUSTOMERS:
        # Check if customer already exists
        existing = None
        if cust_data.get("email"):
            existing = db.query(Customer).filter(Customer.email == cust_data["email"]).first()
        elif cust_data.get("phone"):
            existing = db.query(Customer).filter(Customer.phone == cust_data["phone"]).first()
        
        if existing:
            print(f"  Customer {cust_data['name']} already exists, skipping...")
            customer_map[cust_data["name"]] = existing
            continue
        
        customer = Customer(
            name=cust_data["name"],
            phone=cust_data.get("phone"),
            email=cust_data.get("email"),
            loyalty_points=cust_data["loyalty_points"],
        )
        db.add(customer)
        db.flush()
        customer_map[cust_data["name"]] = customer
        print(f"  Created customer: {cust_data['name']}")
    
    db.commit()
    return customer_map


def seed_ingredients(db: Session):
    """Seed ingredients"""
    print("Seeding ingredients...")
    ingredient_map = {}
    
    for ing_data in MOCK_INGREDIENTS:
        # Check if ingredient already exists
        existing = db.query(Ingredient).filter(Ingredient.name == ing_data["name"]).first()
        if existing:
            print(f"  Ingredient {ing_data['name']} already exists, skipping...")
            ingredient_map[ing_data["name"]] = existing
            continue
        
        ingredient = Ingredient(name=ing_data["name"], unit=ing_data["unit"])
        db.add(ingredient)
        db.flush()
        ingredient_map[ing_data["name"]] = ingredient
        print(f"  Created ingredient: {ing_data['name']}")
    
    db.commit()
    return ingredient_map


def seed_menu_items(db: Session):
    """Seed menu items"""
    print("Seeding menu items...")
    menu_item_map = {}
    
    for item_data in MOCK_MENU_ITEMS:
        # Check if menu item already exists
        existing = db.query(MenuItem).filter(MenuItem.name == item_data["name"]).first()
        if existing:
            print(f"  Menu item {item_data['name']} already exists, skipping...")
            menu_item_map[item_data["name"]] = existing
            continue
        
        menu_item = MenuItem(
            name=item_data["name"],
            price=item_data["price"],
            category=item_data["category"],
            description=item_data["description"],
            is_available=item_data["is_available"],
        )
        db.add(menu_item)
        db.flush()
        menu_item_map[item_data["name"]] = menu_item
        print(f"  Created menu item: {item_data['name']}")
    
    db.commit()
    return menu_item_map


def seed_inventory(db: Session, employee_map: dict, ingredient_map: dict):
    """Seed inventory"""
    print("Seeding inventory...")
    
    # Get manager employee
    manager = None
    for emp in employee_map.values():
        if emp.role == "Manager":
            manager = emp
            break
    
    if not manager:
        print("  No manager found, skipping inventory...")
        return
    
    for inv_data in MOCK_INVENTORY:
        ingredient = ingredient_map.get(inv_data["ingredient_name"])
        if not ingredient:
            print(f"  Ingredient {inv_data['ingredient_name']} not found, skipping...")
            continue
        
        # Check if inventory already exists for this ingredient
        existing = db.query(Inventory).filter(
            Inventory.ingredient_id == ingredient.ingredient_id
        ).first()
        
        if existing:
            print(f"  Inventory for {inv_data['ingredient_name']} already exists, skipping...")
            continue
        
        inventory = Inventory(
            ingredient_id=ingredient.ingredient_id,
            quantity=inv_data["quantity"],
            min_threshold=inv_data["min_threshold"],
            employee_id=manager.emp_id,
        )
        db.add(inventory)
        print(f"  Created inventory: {inv_data['ingredient_name']} ({inv_data['quantity']} {ingredient.unit})")
    
    db.commit()


def seed_orders(db: Session, customer_map: dict, menu_item_map: dict):
    """Seed orders and order details"""
    print("Seeding orders...")
    
    today = date.today()
    yesterday = date.fromordinal(today.toordinal() - 1)
    
    # Order 1
    customer1 = customer_map.get("Alice Brown")
    if customer1:
        order1 = Order(
            customer_id=customer1.customer_id,
            order_date=today,
            total_amount=240.00,
            status="pending",
        )
        db.add(order1)
        db.flush()
        
        # Order details for order 1
        espresso = menu_item_map.get("Espresso")
        chocolate_cake = menu_item_map.get("Chocolate Cake")
        
        if espresso:
            detail1 = OrderDetail(
                order_id=order1.order_id,
                item_id=espresso.item_id,
                quantity=2,
                unit_price=60.00,
                subtotal=120.00,
            )
            db.add(detail1)
        
        if chocolate_cake:
            detail2 = OrderDetail(
                order_id=order1.order_id,
                item_id=chocolate_cake.item_id,
                quantity=1,
                unit_price=120.00,
                subtotal=120.00,
            )
            db.add(detail2)
        
        print(f"  Created order 1 for {customer1.name}")
    
    # Order 2
    customer2 = customer_map.get("Bob Davis")
    if customer2:
        order2 = Order(
            customer_id=customer2.customer_id,
            order_date=today,
            total_amount=190.00,
            status="completed",
        )
        db.add(order2)
        db.flush()
        
        cappuccino = menu_item_map.get("Cappuccino")
        croissant = menu_item_map.get("Croissant")
        
        if cappuccino:
            detail1 = OrderDetail(
                order_id=order2.order_id,
                item_id=cappuccino.item_id,
                quantity=1,
                unit_price=80.00,
                subtotal=80.00,
            )
            db.add(detail1)
        
        if croissant:
            detail2 = OrderDetail(
                order_id=order2.order_id,
                item_id=croissant.item_id,
                quantity=2,
                unit_price=55.00,
                subtotal=110.00,
            )
            db.add(detail2)
        
        print(f"  Created order 2 for {customer2.name}")
    
    # Order 3 (no customer)
    latte = menu_item_map.get("Latte")
    if latte:
        order3 = Order(
            customer_id=None,
            order_date=today,
            total_amount=170.00,
            status="pending",
        )
        db.add(order3)
        db.flush()
        
        detail1 = OrderDetail(
            order_id=order3.order_id,
            item_id=latte.item_id,
            quantity=2,
            unit_price=85.00,
            subtotal=170.00,
        )
        db.add(detail1)
        print("  Created order 3 (no customer)")
    
    # Order 4 (yesterday)
    customer3 = customer_map.get("Carol White")
    mocha = menu_item_map.get("Mocha")
    if customer3 and mocha:
        order4 = Order(
            customer_id=customer3.customer_id,
            order_date=yesterday,
            total_amount=95.00,
            status="completed",
        )
        db.add(order4)
        db.flush()
        
        detail1 = OrderDetail(
            order_id=order4.order_id,
            item_id=mocha.item_id,
            quantity=1,
            unit_price=95.00,
            subtotal=95.00,
        )
        db.add(detail1)
        print(f"  Created order 4 for {customer3.name} (yesterday)")
    
    db.commit()


def main():
    """Main function to seed all data"""
    print("=" * 60)
    print("Seeding database with mock data...")
    print("=" * 60)
    
    db: Session = SessionLocal()
    
    try:
        # Seed in order of dependencies
        employee_map = seed_employees(db)
        customer_map = seed_customers(db)
        ingredient_map = seed_ingredients(db)
        menu_item_map = seed_menu_items(db)
        seed_inventory(db, employee_map, ingredient_map)
        seed_orders(db, customer_map, menu_item_map)
        
        print("=" * 60)
        print("✅ Database seeding completed successfully!")
        print("=" * 60)
        print("\nDemo credentials:")
        print("  Manager: john.smith@coffeeshop.com / password123")
        print("  Barista: sarah.j@coffeeshop.com / password123")
        print("  Cashier: emma.w@coffeeshop.com / password123")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

