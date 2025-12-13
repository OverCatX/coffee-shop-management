# Database Schema

Complete documentation of the database schema, Entity-Relationship Diagram (ERD), and table structures.

## Entity-Relationship Diagram (ERD)

### Core Entities

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Employees  │─────────│   Managers   │         │  Baristas   │
│             │         │              │         │             │
│ - emp_id    │         │ - emp_id (FK)│         │ - emp_id(FK)│
│ - name      │         │ - created_at │         │ - created_at│
│ - role      │         │ - updated_at │         │ - updated_at│
│ - email     │         └──────────────┘         └─────────────┘
│ - password  │                  │                       │
└─────────────┘                  │                       │
      │                          │                       │
      │                          │                       │
      │                   ┌──────┴──────┐                │
      │                   │             │                │
      │              ┌─────────┐  ┌──────────────┐  ┌──────────────┐
      │              │ Orders   │  │ BaristaMenu │  │ MenuItems   │
      │              │          │  │ Items       │  │             │
      │              │ -order_id│  │ -barista_id │  │ -item_id    │
      │              │ -status  │  │ -item_id    │  │ -name       │
      │              └─────────┘  └──────────────┘  │ -price      │
      │                   │                          │ -category   │
      │                   │                          └─────────────┘
      │                   │                                │
      │                   │                                │
      │              ┌─────────────┐                  ┌──────────────┐
      │              │OrderDetails │                  │MenuItemIngre│
      │              │             │                  │dients        │
      │              │ -order_id   │                  │ -item_id     │
      │              │ -item_id    │                  │ -ingredient_│
      │              │ -quantity   │                  │   id         │
      │              └─────────────┘                  │ -amount      │
      │                                                └──────────────┘
      │                                                       │
      │                                                       │
┌─────────────┐                                      ┌──────────────┐
│  Customers  │                                      │ Ingredients  │
│             │                                      │              │
│ -customer_id│                                      │ -ingredient_│
│ -name       │                                      │   id         │
│ -email      │                                      │ -name        │
│ -points     │                                      │ -unit        │
└─────────────┘                                      └──────────────┘
      │                                                       │
      │                                                       │
      │                                              ┌──────────────┐
      │                                              │  Inventory   │
      │                                              │              │
      │                                              │ -inventory_id│
      │                                              │ -ingredient_ │
      │                                              │   id         │
      │                                              │ -quantity    │
      │                                              │ -threshold   │
      │                                              └──────────────┘
      │
┌─────────────┐
│  Payments   │
│             │
│ -payment_id │
│ -order_id   │
│ -amount     │
│ -method     │
└─────────────┘
```

## Table Structures

### employees

Primary table for all employees.

| Column        | Type          | Constraints             | Description                      |
| ------------- | ------------- | ----------------------- | -------------------------------- |
| emp_id        | INTEGER       | PRIMARY KEY             | Employee ID                      |
| name          | VARCHAR(100)  | NOT NULL                | Employee name                    |
| role          | VARCHAR(50)   | NOT NULL                | Role (Manager, Barista, Cashier) |
| salary        | DECIMAL(10,2) | NOT NULL, CHECK > 0     | Salary                           |
| email         | VARCHAR(255)  | UNIQUE                  | Email address                    |
| phone         | VARCHAR(20)   |                         | Phone number                     |
| hire_date     | DATE          | NOT NULL                | Hire date                        |
| password_hash | VARCHAR(255)  |                         | Bcrypt password hash             |
| created_at    | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Creation timestamp               |
| updated_at    | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Update timestamp                 |
| is_deleted    | BOOLEAN       | DEFAULT FALSE           | Soft delete flag                 |

**Indexes:**

- `idx_employees_email` on `email`
- `idx_employees_role` on `role`

### managers

Manager-specific information (inherits from employees).

| Column     | Type      | Constraints                 | Description         |
| ---------- | --------- | --------------------------- | ------------------- |
| emp_id     | INTEGER   | PRIMARY KEY, FK → employees | Manager employee ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW()     | Creation timestamp  |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW()     | Update timestamp    |
| is_deleted | BOOLEAN   | DEFAULT FALSE               | Soft delete flag    |

### baristas

Barista-specific information (inherits from employees).

| Column     | Type      | Constraints                 | Description         |
| ---------- | --------- | --------------------------- | ------------------- |
| emp_id     | INTEGER   | PRIMARY KEY, FK → employees | Barista employee ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW()     | Creation timestamp  |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW()     | Update timestamp    |
| is_deleted | BOOLEAN   | DEFAULT FALSE               | Soft delete flag    |

### customers

Customer information.

| Column         | Type          | Constraints             | Description        |
| -------------- | ------------- | ----------------------- | ------------------ |
| customer_id    | INTEGER       | PRIMARY KEY             | Customer ID        |
| name           | VARCHAR(100)  | NOT NULL                | Customer name      |
| phone          | VARCHAR(20)   | UNIQUE                  | Phone number       |
| email          | VARCHAR(255)  | UNIQUE                  | Email address      |
| loyalty_points | DECIMAL(10,2) | DEFAULT 0, CHECK >= 0   | Loyalty points     |
| created_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Update timestamp   |
| is_deleted     | BOOLEAN       | DEFAULT FALSE           | Soft delete flag   |

**Indexes:**

- `idx_customers_email` on `email`
- `idx_customers_phone` on `phone`

### menu_items

Menu items catalog.

| Column       | Type          | Constraints             | Description        |
| ------------ | ------------- | ----------------------- | ------------------ |
| item_id      | INTEGER       | PRIMARY KEY             | Menu item ID       |
| name         | VARCHAR(100)  | NOT NULL, UNIQUE        | Item name          |
| price        | DECIMAL(10,2) | NOT NULL, CHECK > 0     | Price              |
| category     | VARCHAR(50)   | NOT NULL                | Category           |
| description  | VARCHAR(500)  |                         | Description        |
| is_available | BOOLEAN       | DEFAULT TRUE            | Availability       |
| created_at   | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at   | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Update timestamp   |
| is_deleted   | BOOLEAN       | DEFAULT FALSE           | Soft delete flag   |

**Indexes:**

- `idx_menu_item_name` on `name`
- `idx_menu_item_category_available` on `(category, is_available)`

### ingredients

Ingredient catalog.

| Column        | Type         | Constraints             | Description         |
| ------------- | ------------ | ----------------------- | ------------------- |
| ingredient_id | INTEGER      | PRIMARY KEY             | Ingredient ID       |
| name          | VARCHAR(100) | NOT NULL, UNIQUE        | Ingredient name     |
| unit          | VARCHAR(20)  | NOT NULL                | Unit of measurement |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Creation timestamp  |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Update timestamp    |
| is_deleted    | BOOLEAN      | DEFAULT FALSE           | Soft delete flag    |

**Indexes:**

- `idx_ingredients_name` on `name`

### menu_item_ingredients

Junction table for menu items and ingredients (many-to-many).

| Column          | Type          | Constraints                   | Description        |
| --------------- | ------------- | ----------------------------- | ------------------ |
| item_id         | INTEGER       | PRIMARY KEY, FK → menu_items  | Menu item ID       |
| ingredient_id   | INTEGER       | PRIMARY KEY, FK → ingredients | Ingredient ID      |
| amount_required | DECIMAL(10,2) | NOT NULL, CHECK > 0           | Amount required    |
| unit            | VARCHAR(20)   | NOT NULL                      | Unit               |
| created_at      | TIMESTAMP     | NOT NULL, DEFAULT NOW()       | Creation timestamp |
| updated_at      | TIMESTAMP     | NOT NULL, DEFAULT NOW()       | Update timestamp   |
| is_deleted      | BOOLEAN       | DEFAULT FALSE                 | Soft delete flag   |

### inventory

Inventory tracking.

| Column        | Type          | Constraints                | Description           |
| ------------- | ------------- | -------------------------- | --------------------- |
| inventory_id  | INTEGER       | PRIMARY KEY                | Inventory ID          |
| ingredient_id | INTEGER       | NOT NULL, FK → ingredients | Ingredient ID         |
| quantity      | DECIMAL(10,2) | NOT NULL, CHECK >= 0       | Current quantity      |
| min_threshold | DECIMAL(10,2) | DEFAULT 0, CHECK >= 0      | Minimum threshold     |
| employee_id   | INTEGER       | FK → employees             | Employee who updated  |
| last_updated  | TIMESTAMP     | NOT NULL, DEFAULT NOW()    | Last update timestamp |
| created_at    | TIMESTAMP     | NOT NULL, DEFAULT NOW()    | Creation timestamp    |
| updated_at    | TIMESTAMP     | NOT NULL, DEFAULT NOW()    | Update timestamp      |
| is_deleted    | BOOLEAN       | DEFAULT FALSE              | Soft delete flag      |

**Indexes:**

- `idx_inventory_ingredient_quantity` on `(ingredient_id, quantity)`

### orders

Order headers.

| Column       | Type          | Constraints             | Description                          |
| ------------ | ------------- | ----------------------- | ------------------------------------ |
| order_id     | INTEGER       | PRIMARY KEY             | Order ID                             |
| customer_id  | INTEGER       | FK → customers          | Customer ID (nullable)               |
| order_date   | DATE          | NOT NULL                | Order date                           |
| total_amount | DECIMAL(10,2) | NOT NULL, CHECK >= 0    | Total amount                         |
| status       | VARCHAR(20)   | NOT NULL, CHECK IN      | Status (pending/completed/cancelled) |
| created_at   | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Creation timestamp                   |
| updated_at   | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Update timestamp                     |
| is_deleted   | BOOLEAN       | DEFAULT FALSE           | Soft delete flag                     |

**Indexes:**

- `idx_orders_customer` on `customer_id`
- `idx_orders_date` on `order_date`
- `idx_orders_status` on `status`

### order_details

Order line items.

| Column     | Type          | Constraints                  | Description        |
| ---------- | ------------- | ---------------------------- | ------------------ |
| order_id   | INTEGER       | PRIMARY KEY, FK → orders     | Order ID           |
| item_id    | INTEGER       | PRIMARY KEY, FK → menu_items | Menu item ID       |
| quantity   | INTEGER       | NOT NULL, CHECK > 0          | Quantity           |
| unit_price | DECIMAL(10,2) | NOT NULL, CHECK >= 0         | Unit price         |
| subtotal   | DECIMAL(10,2) | NOT NULL, CHECK >= 0         | Subtotal           |
| created_at | TIMESTAMP     | NOT NULL, DEFAULT NOW()      | Creation timestamp |
| updated_at | TIMESTAMP     | NOT NULL, DEFAULT NOW()      | Update timestamp   |
| is_deleted | BOOLEAN       | DEFAULT FALSE                | Soft delete flag   |

### payments

Payment records.

| Column         | Type          | Constraints             | Description        |
| -------------- | ------------- | ----------------------- | ------------------ |
| payment_id     | INTEGER       | PRIMARY KEY             | Payment ID         |
| order_id       | INTEGER       | NOT NULL, FK → orders   | Order ID           |
| payment_method | VARCHAR(50)   | NOT NULL                | Payment method     |
| payment_amount | DECIMAL(10,2) | NOT NULL, CHECK > 0     | Payment amount     |
| payment_date   | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Payment date       |
| created_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Update timestamp   |
| is_deleted     | BOOLEAN       | DEFAULT FALSE           | Soft delete flag   |

**Indexes:**

- `idx_payments_order` on `order_id`
- `idx_payments_date` on `payment_date`

### barista_menu_items

Barista proficiency for menu items.

| Column            | Type        | Constraints                  | Description                         |
| ----------------- | ----------- | ---------------------------- | ----------------------------------- |
| barista_id        | INTEGER     | PRIMARY KEY, FK → baristas   | Barista ID                          |
| item_id           | INTEGER     | PRIMARY KEY, FK → menu_items | Menu item ID                        |
| proficiency_level | VARCHAR(20) | NOT NULL, CHECK IN           | Level (basic/intermediate/advanced) |
| created_at        | TIMESTAMP   | NOT NULL, DEFAULT NOW()      | Creation timestamp                  |
| updated_at        | TIMESTAMP   | NOT NULL, DEFAULT NOW()      | Update timestamp                    |
| is_deleted        | BOOLEAN     | DEFAULT FALSE                | Soft delete flag                    |

## Relationships

### One-to-Many

- `employees` → `managers` (1:1 via emp_id)
- `employees` → `baristas` (1:1 via emp_id)
- `customers` → `orders` (1:N)
- `orders` → `order_details` (1:N)
- `orders` → `payments` (1:N)
- `ingredients` → `inventory` (1:N)
- `menu_items` → `order_details` (1:N)

### Many-to-Many

- `menu_items` ↔ `ingredients` (via `menu_item_ingredients`)
- `baristas` ↔ `menu_items` (via `barista_menu_items`)

## Constraints Summary

### Primary Keys

- All tables have primary keys
- Composite keys used for junction tables

### Foreign Keys

- All foreign keys have `ON DELETE CASCADE` or appropriate action
- Referential integrity enforced

### Check Constraints

- Price values must be > 0
- Quantity values must be >= 0
- Status values restricted to specific enums
- Proficiency levels restricted to specific values

### Unique Constraints

- Employee email
- Customer email and phone
- Menu item name
- Ingredient name

## Indexes Summary

### Performance Indexes

- Email indexes for fast lookups
- Category and status indexes for filtering
- Composite indexes for common query patterns
- Foreign key indexes for join optimization

## Related Documentation

- [Normalization](normalization.md) - Database normalization principles
- [Constraints & Indexes](constraints-indexes.md) - Detailed constraint and index documentation
- [Migrations](migrations.md) - Database migration guide
