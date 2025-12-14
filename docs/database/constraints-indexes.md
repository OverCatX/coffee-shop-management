# Constraints & Indexes

Comprehensive documentation of database constraints and indexes used for data integrity and performance optimization.

## Constraints

Constraints ensure data integrity and enforce business rules at the database level.

### Primary Key Constraints

Every table has a primary key that uniquely identifies each row.

**Examples:**
```sql
-- Single column primary key
employees.emp_id PRIMARY KEY

-- Composite primary key
order_details (order_id, item_id) PRIMARY KEY
menu_item_ingredients (item_id, ingredient_id) PRIMARY KEY
```

**Benefits:**
- Ensures uniqueness
- Automatically creates index
- Enables foreign key references

### Foreign Key Constraints

Foreign keys maintain referential integrity between tables.

**Examples:**
```sql
-- Foreign key with SET NULL
orders.customer_id REFERENCES customers(customer_id) ON DELETE SET NULL

-- Foreign key in junction table
menu_item_ingredients.item_id REFERENCES menu_items(item_id) ON DELETE CASCADE
menu_item_ingredients.ingredient_id REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
```

**Cascade Behaviors:**
- `ON DELETE CASCADE` - Delete related records
- `ON DELETE SET NULL` - Set foreign key to NULL
- `ON DELETE RESTRICT` - Prevent deletion if references exist

### Check Constraints

Check constraints enforce domain rules and business logic.

**Examples:**

```sql
-- Price must be positive
ALTER TABLE menu_items 
ADD CONSTRAINT check_price_positive 
CHECK (price > 0);

-- Quantity must be non-negative
ALTER TABLE inventory 
ADD CONSTRAINT check_quantity_non_negative 
CHECK (quantity >= 0);

-- Status must be valid value
ALTER TABLE orders 
ADD CONSTRAINT check_status_valid 
CHECK (status IN ('pending', 'completed', 'cancelled'));
```

**All Check Constraints:**

| Table | Constraint | Rule |
|-------|-----------|------|
| menu_items | check_price_positive | price > 0 |
| employees | check_salary_positive | salary > 0 |
| inventory | check_quantity_non_negative | quantity >= 0 |
| inventory | check_threshold_non_negative | min_threshold >= 0 |
| orders | check_total_amount_non_negative | total_amount >= 0 |
| orders | check_status_valid | status IN ('pending', 'completed', 'cancelled') |
| order_details | check_quantity_positive | quantity > 0 |
| order_details | check_unit_price_non_negative | unit_price >= 0 |
| order_details | check_subtotal_non_negative | subtotal >= 0 |
| payments | check_payment_amount_positive | payment_amount > 0 |
| customers | check_loyalty_points_non_negative | loyalty_points >= 0 |
| menu_item_ingredients | check_amount_required_positive | amount_required > 0 |

### Unique Constraints

Unique constraints ensure no duplicate values in specified columns.

**Examples:**
```sql
-- Unique email
ALTER TABLE employees 
ADD CONSTRAINT unique_employee_email 
UNIQUE (email);

-- Unique customer phone
ALTER TABLE customers 
ADD CONSTRAINT unique_customer_phone 
UNIQUE (phone);

-- Unique menu item name
ALTER TABLE menu_items 
ADD CONSTRAINT unique_menu_item_name 
UNIQUE (name);
```

**All Unique Constraints:**

| Table | Column(s) | Constraint Name |
|-------|-----------|----------------|
| employees | email | unique_employee_email |
| customers | email | unique_customer_email |
| customers | phone | unique_customer_phone |
| menu_items | name | unique_menu_item_name |
| ingredients | name | unique_ingredient_name |

### Not Null Constraints

Not null constraints ensure required fields always have values.

**Examples:**
```sql
-- Required fields
employees.name NOT NULL
employees.role NOT NULL
employees.salary NOT NULL
orders.order_date NOT NULL
orders.status NOT NULL
```

## Indexes

Indexes improve query performance by creating fast lookup structures.

### Primary Key Indexes

Automatically created for all primary keys.

**Examples:**
- `employees_pkey` on `employees(emp_id)`
- `orders_pkey` on `orders(order_id)`
- `order_details_pkey` on `order_details(order_id, item_id)`

### Foreign Key Indexes

Created for foreign key columns to optimize joins.

**Examples:**
```sql
-- Index on foreign key
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_details_order ON order_details(order_id);
CREATE INDEX idx_order_details_item ON order_details(item_id);
```

### Unique Indexes

Created automatically for unique constraints.

**Examples:**
- `unique_employee_email` on `employees(email)`
- `unique_menu_item_name` on `menu_items(name)`

### Composite Indexes

Indexes on multiple columns for complex queries.

**Examples:**
```sql
-- Composite index for filtering
CREATE INDEX idx_menu_item_category_available 
ON menu_items(category, is_available);

-- Composite index for range queries
CREATE INDEX idx_inventory_ingredient_quantity 
ON inventory(ingredient_id, quantity);

-- Composite index for date filtering
CREATE INDEX idx_orders_date_status 
ON orders(order_date DESC, status);
```

### Functional Indexes

Indexes on expressions or functions.

**Examples:**
```sql
-- Index on lowercase email for case-insensitive searches
CREATE INDEX idx_employees_email_lower 
ON employees(LOWER(email));
```

## Index Strategy

### When to Create Indexes

1. **Foreign Keys** - Always index foreign keys
2. **Frequently Queried Columns** - Columns used in WHERE clauses
3. **Join Columns** - Columns used in JOIN operations
4. **Order By Columns** - Columns used in ORDER BY
5. **Composite Queries** - Multiple column filters

### Index Maintenance

```sql
-- Analyze tables for query optimization
ANALYZE employees;
ANALYZE orders;

-- Rebuild indexes
REINDEX TABLE employees;
REINDEX TABLE orders;

-- View index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Performance Considerations

### Index Overhead

- **Storage:** Indexes consume disk space
- **Write Performance:** Indexes slow down INSERT/UPDATE/DELETE
- **Maintenance:** Indexes need periodic maintenance

### Index Selection

**High Selectivity:** Good candidates for indexing
- Email addresses
- Unique identifiers
- Status fields with few values

**Low Selectivity:** May not benefit from indexing
- Boolean flags (unless combined with other columns)
- Columns with very few distinct values

### Composite Index Order

Order matters in composite indexes:

```sql
-- Good: Most selective column first
CREATE INDEX idx_menu_category_available 
ON menu_items(category, is_available);
-- Use when: WHERE category = 'Coffee' AND is_available = true

-- Less optimal: Less selective column first
CREATE INDEX idx_menu_available_category 
ON menu_items(is_available, category);
```

## Constraint Validation

### Check Constraint Performance

Check constraints are evaluated on every INSERT/UPDATE:

```sql
-- Efficient: Simple comparison
CHECK (price > 0)

-- Less efficient: Complex expression
CHECK (price > 0 AND price < 10000 AND MOD(price, 0.01) = 0)
```

### Foreign Key Performance

Foreign keys create indexes automatically but add overhead:

- **INSERT:** Validates parent record exists
- **UPDATE:** Validates new parent record exists
- **DELETE:** Checks for child records (if RESTRICT)

## Best Practices

1. **Always use primary keys** - Every table should have a PK
2. **Index foreign keys** - Improves join performance
3. **Use check constraints** - Enforce business rules at DB level
4. **Unique constraints** - Prevent duplicate data
5. **Monitor index usage** - Remove unused indexes
6. **Regular maintenance** - ANALYZE and REINDEX periodically

## Related Documentation

- [Database Schema](schema.md) - Complete schema with constraints
- [Normalization](normalization.md) - Database normalization principles
- [Migrations](migrations.md) - Creating constraints via migrations
- [Transactions](transactions.md) - Transaction management and ACID properties
- [Query Optimization](query-optimization.md) - Using indexes for optimization

