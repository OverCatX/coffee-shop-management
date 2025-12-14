# Database Schema

Complete documentation of the database schema, Entity-Relationship Diagram (ERD), and table structures.

## Entity-Relationship Diagram (ERD)

![ERD Diagram](../ERD-Diagram.png)

## Table Structures

### employees

**Purpose:** Employee information for authentication and role-based access control.

**Key Columns:** `emp_id` (PK), `name`, `role`, `email` (UNIQUE), `password_hash`, `salary`

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

- `ix_employees_email` on `email` (UNIQUE, WHERE email IS NOT NULL)
- `ix_employees_phone` on `phone` (UNIQUE, WHERE phone IS NOT NULL)

### customers

**Purpose:** Customer information and loyalty points tracking.

**Key Columns:** `customer_id` (PK), `name`, `phone` (UNIQUE), `email` (UNIQUE), `loyalty_points`

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

**Purpose:** Menu items catalog with prices and availability.

**Key Columns:** `item_id` (PK), `name` (UNIQUE), `price`, `category`, `is_available`

| Column       | Type          | Constraints             | Description        |
| ------------ | ------------- | ----------------------- | ------------------ |
| item_id      | INTEGER       | PRIMARY KEY             | Menu item ID       |
| name         | VARCHAR(100)  | NOT NULL, UNIQUE        | Item name          |
| price        | DECIMAL(10,2) | NOT NULL, CHECK > 0     | Price              |
| category     | VARCHAR(50)   | NOT NULL                | Category           |
| description  | VARCHAR(500)  |                         | Description        |
| image_url    | VARCHAR(500)  |                         | Image URL          |
| is_available | BOOLEAN       | DEFAULT TRUE            | Availability       |
| created_at   | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at   | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Update timestamp   |
| is_deleted   | BOOLEAN       | DEFAULT FALSE           | Soft delete flag   |

**Indexes:**

- `ix_menu_items_name` on `name` (UNIQUE)
- `ix_menu_items_category` on `category`
- `ix_menu_items_is_available` on `is_available`
- `idx_menu_item_category_available` on `(category, is_available)`

### ingredients

**Purpose:** Ingredients used in recipes and inventory.

**Key Columns:** `ingredient_id` (PK), `name` (UNIQUE), `unit`

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

**Purpose:** Junction table for menu items ↔ ingredients (Many-to-Many). Stores recipes.

**Key Columns:** `(item_id, ingredient_id)` (PK), `amount_required`, `unit`

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

**Purpose:** Tracks ingredient stock quantities and low stock alerts.

**Key Columns:** `inventory_id` (PK), `ingredient_id` (FK), `quantity`, `min_threshold`, `employee_id` (FK)

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

**Purpose:** Order header with customer, date, total amount, and status.

**Key Columns:** `order_id` (PK), `customer_id` (FK, nullable), `order_date`, `total_amount`, `status`

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

**Purpose:** Order line items with quantity, unit price, and subtotal.

**Key Columns:** `(order_id, item_id)` (PK), `quantity`, `unit_price`, `subtotal`

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

**Purpose:** Payment records with method, amount, and status.

**Key Columns:** `payment_id` (PK), `order_id` (FK), `payment_method`, `amount`, `status`, `payment_date`

| Column         | Type          | Constraints              | Description                       |
| -------------- | ------------- | ------------------------ | --------------------------------- |
| payment_id     | INTEGER       | PRIMARY KEY              | Payment ID                        |
| order_id       | INTEGER       | NOT NULL, FK → orders    | Order ID                          |
| payment_method | VARCHAR(50)   | NOT NULL                 | Payment method                    |
| amount         | DECIMAL(10,2) | NOT NULL, CHECK > 0      | Payment amount                    |
| status         | VARCHAR(20)   | DEFAULT 'pending', CHECK | Status (pending/completed/failed) |
| payment_date   | TIMESTAMP     | NOT NULL, DEFAULT NOW()  | Payment date                      |
| created_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW()  | Creation timestamp                |
| updated_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW()  | Update timestamp                  |
| is_deleted     | BOOLEAN       | DEFAULT FALSE            | Soft delete flag                  |

**Indexes:**

- `ix_payments_order_id` on `order_id`
- `ix_payments_status` on `status`
- `ix_payments_payment_date` on `payment_date`
- `idx_payment_order_status` on `(order_id, status)`
- `idx_payment_date_status` on `(payment_date, status)`

## Relationships

### One-to-Many

- `customers` → `orders` (1:N)
- `orders` → `order_details` (1:N)
- `orders` → `payments` (1:N)
- `ingredients` → `inventory` (1:N)
- `menu_items` → `order_details` (1:N)
- `employees` → `inventory` (1:N)

### Many-to-Many

- `menu_items` ↔ `ingredients` (via `menu_item_ingredients`)

## Constraints & Indexes

### Constraints

Constraints ensure data integrity and enforce business rules at the database level.

#### Primary Key Constraints

Every table has a primary key. Single column (e.g., `employees.emp_id`) or composite (e.g., `order_details (order_id, item_id)`).

#### Foreign Key Constraints

Foreign keys maintain referential integrity. Cascade behaviors: `ON DELETE CASCADE`, `ON DELETE SET NULL`, `ON DELETE RESTRICT`.

#### Check Constraints

Check constraints enforce domain rules and business logic.

**All Check Constraints:**

| Table                 | Constraint                        | Rule                                            |
| --------------------- | --------------------------------- | ----------------------------------------------- |
| menu_items            | check_price_positive              | price > 0                                       |
| employees             | check_salary_positive             | salary > 0                                      |
| inventory             | check_quantity_non_negative       | quantity >= 0                                   |
| inventory             | check_threshold_non_negative      | min_threshold >= 0                              |
| orders                | check_total_amount_non_negative   | total_amount >= 0                               |
| orders                | check_status_valid                | status IN ('pending', 'completed', 'cancelled') |
| order_details         | check_quantity_positive           | quantity > 0                                    |
| order_details         | check_unit_price_non_negative     | unit_price >= 0                                 |
| order_details         | check_subtotal_non_negative       | subtotal >= 0                                   |
| payments              | check_payment_amount_positive     | payment_amount > 0                              |
| customers             | check_loyalty_points_non_negative | loyalty_points >= 0                             |
| menu_item_ingredients | check_amount_required_positive    | amount_required > 0                             |

#### Unique Constraints

Unique constraints ensure no duplicate values in specified columns.

**All Unique Constraints:**

| Table       | Column(s) | Constraint Name        |
| ----------- | --------- | ---------------------- |
| employees   | email     | unique_employee_email  |
| customers   | email     | unique_customer_email  |
| customers   | phone     | unique_customer_phone  |
| menu_items  | name      | unique_menu_item_name  |
| ingredients | name      | unique_ingredient_name |

#### Not Null Constraints

Not null constraints ensure required fields always have values. Examples include `employees.name`, `employees.role`, `orders.order_date`, `orders.status`.

### Indexes

Indexes improve query performance by creating fast lookup structures.

#### Primary Key Indexes

Automatically created for all primary keys (e.g., `employees_pkey`, `orders_pkey`).

#### Foreign Key Indexes

Created for foreign key columns to optimize joins (e.g., `idx_orders_customer`, `idx_order_details_order`).

#### Unique Indexes

Created automatically for unique constraints (e.g., `unique_employee_email`, `unique_menu_item_name`).

#### Composite Indexes

Indexes on multiple columns for complex queries:

- `idx_menu_item_category_available` on `menu_items(category, is_available)`
- `idx_inventory_ingredient_quantity` on `inventory(ingredient_id, quantity)`
- `idx_payment_order_status` on `payments(order_id, status)`

#### Index Strategy

**When to Create:** Foreign keys, frequently queried columns, join columns, ORDER BY columns, composite queries.

**Maintenance:** Use `ANALYZE` and `REINDEX` periodically. Monitor usage with `pg_stat_user_indexes`.

## Related Documentation

- [Normalization](normalization.md) - Database normalization principles and functional dependencies
- [Migrations](migrations.md) - Database migration guide and version control
- [Transactions](transactions.md) - Transaction management and ACID properties
- [Query Optimization](query-optimization.md) - Query performance optimization techniques and SQL queries
