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
managers (emp_id, ...)  -- Role-specific data separated

-- ❌ Incorrect (violates 3NF)
employees (emp_id, name, email, role, salary, manager_bonus)
-- manager_bonus depends on role, not emp_id directly
```

## Normalization Examples

### Employee Management

**Design Decision:** Separate `employees`, `managers`, and `baristas` tables.

**Reasoning:**

- Common employee data in `employees` table
- Role-specific data in separate tables
- Eliminates NULL values and data redundancy
- Follows 3NF principles

**Structure:**

```
employees (emp_id, name, email, role, salary, ...)
    ↓
managers (emp_id, ...)  -- Manager-specific attributes
baristas (emp_id, ...)  -- Barista-specific attributes
```

### Menu Items and Ingredients

**Design Decision:** Junction table `menu_item_ingredients` for many-to-many relationship.

**Reasoning:**

- Menu items can have multiple ingredients
- Ingredients can be used in multiple menu items
- Junction table stores relationship-specific data (amount_required)
- Eliminates data duplication

**Structure:**

```
menu_items (item_id, name, price, ...)
    ↓
menu_item_ingredients (item_id, ingredient_id, amount_required, unit)
    ↓
ingredients (ingredient_id, name, unit, ...)
```

### Orders and Order Details

**Design Decision:** Separate `orders` (header) and `order_details` (line items).

**Reasoning:**

- Order header contains order-level information
- Order details contain item-level information
- Prevents repeating order information for each item
- Follows 1NF and 2NF principles

**Structure:**

```
orders (order_id, customer_id, order_date, total_amount, status, ...)
    ↓
order_details (order_id, item_id, quantity, unit_price, subtotal, ...)
```

## Benefits of Normalization

### 1. Data Integrity

- **No Redundancy:** Each piece of data stored once
- **Consistency:** Updates propagate correctly
- **Referential Integrity:** Foreign keys ensure relationships

### 2. Storage Efficiency

- **Reduced Storage:** No duplicate data
- **Optimized Indexes:** Smaller indexes, faster queries

### 3. Update Efficiency

- **Single Update Point:** Update data in one place
- **No Anomalies:** Insert, update, delete anomalies eliminated

### 4. Query Performance

- **Optimized Joins:** Proper relationships enable efficient joins
- **Index Usage:** Normalized structure allows better indexing

## Denormalization Considerations

While the database follows 3NF, some denormalization may be considered for performance:

### Calculated Fields

**Example:** `order_details.subtotal = quantity * unit_price`

**Decision:** Store calculated value for performance

- Trade-off: Storage vs. calculation speed
- Current design: Store `subtotal` for faster queries

### Aggregated Data

**Example:** `orders.total_amount` (sum of order_details)

**Decision:** Store aggregated value

- Trade-off: Consistency vs. query performance
- Current design: Calculate on insert/update, store result

## Normalization Checklist

- [x] All tables in 1NF (atomic values)
- [x] All tables in 2NF (no partial dependencies)
- [x] All tables in 3NF (no transitive dependencies)
- [x] Proper junction tables for many-to-many relationships
- [x] Role-specific tables separated from base tables
- [x] No redundant data storage
- [x] Foreign keys properly defined

## Related Documentation

- [Database Schema](schema.md) - Complete schema documentation
- [Constraints & Indexes](constraints-indexes.md) - Data integrity constraints
- [Query Optimization](query-optimization.md) - Performance optimization
