# Database Normalization

This document explains the normalization principles applied to the Coffee Shop Management System database design.

## Normalization Overview

The database follows **Third Normal Form (3NF)** principles to eliminate data redundancy and ensure data integrity.

## Normal Forms Applied

### First Normal Form (1NF)

**Rule:** Each column contains atomic (indivisible) values, and there are no repeating groups.

**Applied:**

- All columns contain single atomic values
- No arrays or comma-separated values
- Junction tables used for many-to-many relationships

**Example:**

```sql
-- ✅ Correct (1NF)
menu_item_ingredients (item_id, ingredient_id, amount)

-- ❌ Incorrect (violates 1NF)
menu_items (item_id, ingredients: "coffee, milk, sugar")
```

### Second Normal Form (2NF)

**Rule:** Table is in 1NF and all non-key attributes are fully functionally dependent on the primary key.

**Applied:**

- All non-key attributes depend on the entire primary key
- Composite keys properly designed
- No partial dependencies

**Example:**

```sql
-- ✅ Correct (2NF)
order_details (
    order_id,      -- Part of PK
    item_id,       -- Part of PK
    quantity,      -- Depends on both order_id AND item_id
    unit_price,    -- Depends on both order_id AND item_id
    subtotal       -- Depends on both order_id AND item_id
)

-- ❌ Incorrect (violates 2NF)
order_details (
    order_id,      -- Part of PK
    item_id,       -- Part of PK
    customer_name  -- Depends only on order_id, not item_id
)
```

### Third Normal Form (3NF)

**Rule:** Table is in 2NF and no transitive dependencies exist (non-key attributes don't depend on other non-key attributes).

**Applied:**

- Employee information separated from role-specific data
- Customer information independent of orders
- Ingredient information separate from inventory

**Example:**

```sql
-- ✅ Correct (3NF)
employees (emp_id, name, email, role, salary)

-- ❌ Incorrect (violates 3NF)
employees (emp_id, name, email, role, salary, manager_bonus)
-- manager_bonus depends on role, not emp_id directly
```

## Normalization Examples

**Employee Management:** Single `employees` table with `role` field (no separate manager/barista tables).

**Menu Items ↔ Ingredients:** Junction table `menu_item_ingredients` for many-to-many relationship with `amount_required`.

**Orders:** Separate `orders` (header) and `order_details` (line items) to prevent repeating order information.

## Benefits

- **Data Integrity:** No redundancy, consistent updates, referential integrity
- **Storage Efficiency:** Reduced storage, optimized indexes
- **Update Efficiency:** Single update point, no anomalies
- **Query Performance:** Optimized joins, better indexing

## Denormalization Considerations

Some calculated/aggregated fields stored for performance: `order_details.subtotal` (quantity × unit_price) and `orders.total_amount` (sum of order_details). Calculated on insert/update to maintain consistency.

## Normalization Checklist

- [x] All tables in 1NF (atomic values)
- [x] All tables in 2NF (no partial dependencies)
- [x] All tables in 3NF (no transitive dependencies)
- [x] Proper junction tables for many-to-many relationships
- [x] Single employees table with role field (no unnecessary table separation)
- [x] No redundant data storage
- [x] Foreign keys properly defined

## Functional Dependencies

Functional dependencies (FDs) help understand data relationships and are essential for normalization.

### Functional Dependency Notation

- `A → B` means "A functionally determines B" or "B is functionally dependent on A"
- If `A → B`, then for each value of A, there is exactly one value of B

### Functional Dependencies by Table

**employees:** `emp_id → all attributes`, `email → emp_id`, `phone → emp_id`

**customers:** `customer_id → all attributes`, `phone → customer_id`, `email → customer_id`

**ingredients:** `ingredient_id → all attributes`, `name → ingredient_id`

**menu_items:** `item_id → all attributes`, `name → item_id`

**menu_item_ingredients:** `(item_id, ingredient_id) → amount_required, unit` (composite key)

**inventory:** `inventory_id → all attributes`

**orders:** `order_id → all attributes`

**order_details:** `(order_id, item_id) → quantity, unit_price, subtotal` (composite key)

**payments:** `payment_id → all attributes`

### Summary of Functional Dependencies

| Table                   | Primary Key                | Key Functional Dependencies                                                  |
| ----------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| `employees`             | `emp_id`                   | `emp_id → all attributes`, `email → emp_id`, `phone → emp_id`                |
| `customers`             | `customer_id`              | `customer_id → all attributes`, `phone → customer_id`, `email → customer_id` |
| `ingredients`           | `ingredient_id`            | `ingredient_id → all attributes`, `name → ingredient_id`                     |
| `menu_items`            | `item_id`                  | `item_id → all attributes`, `name → item_id`                                 |
| `menu_item_ingredients` | `(item_id, ingredient_id)` | `(item_id, ingredient_id) → amount_required, unit`                           |
| `inventory`             | `inventory_id`             | `inventory_id → all attributes`                                              |
| `orders`                | `order_id`                 | `order_id → all attributes`                                                  |
| `order_details`         | `(order_id, item_id)`      | `(order_id, item_id) → quantity, unit_price, subtotal`                       |
| `payments`              | `payment_id`               | `payment_id → all attributes`                                                |

### Verification Against Normal Forms

**First Normal Form (1NF) ✓**

- All tables have atomic values (no repeating groups)
- Junction tables used for many-to-many relationships

**Second Normal Form (2NF) ✓**

- All non-key attributes fully depend on the entire primary key
- No partial dependencies in composite keys (e.g., `order_details` requires both `order_id` AND `item_id`)

**Third Normal Form (3NF) ✓**

- No transitive dependencies
- Non-key attributes depend only on the primary key

## Related Documentation

- [Database Schema](schema.md) - Complete schema documentation
- [Migrations](migrations.md) - Database migration guide and version control
- [Transactions](transactions.md) - Transaction management and ACID properties
- [Query Optimization](query-optimization.md) - Performance optimization techniques and SQL queries
