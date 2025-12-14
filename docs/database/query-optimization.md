# Query Processing & Optimization

Guide to query optimization techniques used in the Coffee Shop Management System.

## Query Optimization Overview

Query optimization improves database performance by:
- Reducing query execution time
- Minimizing resource usage
- Improving scalability
- Enhancing user experience

## Index Usage

### Index Selection

Indexes are automatically used by PostgreSQL query planner when beneficial.

**Example:**
```sql
-- Uses index on email
SELECT * FROM employees WHERE email = 'john@example.com';

-- Uses index on (category, is_available)
SELECT * FROM menu_items 
WHERE category = 'Coffee' AND is_available = true;
```

### Index Analysis

```sql
-- View index usage
EXPLAIN ANALYZE 
SELECT * FROM employees WHERE email = 'john@example.com';

-- Output shows:
-- Index Scan using idx_employees_email on employees
```

## Query Optimization Techniques

### 1. Use Indexes Effectively

**Good:**
```sql
-- Uses index
SELECT * FROM orders WHERE customer_id = 123;
```

**Bad:**
```sql
-- Cannot use index (function on indexed column)
SELECT * FROM orders WHERE UPPER(status) = 'PENDING';
```

### 2. Avoid SELECT *

**Good:**
```sql
-- Only fetch needed columns
SELECT order_id, total_amount, status 
FROM orders 
WHERE customer_id = 123;
```

**Bad:**
```sql
-- Fetches all columns unnecessarily
SELECT * FROM orders WHERE customer_id = 123;
```

### 3. Use JOINs Efficiently

**Good:**
```sql
-- Efficient JOIN with indexed columns
SELECT o.order_id, c.name, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'pending';
```

**Bad:**
```sql
-- Inefficient: Multiple queries
SELECT * FROM orders WHERE status = 'pending';
-- Then for each order:
SELECT * FROM customers WHERE customer_id = ?;
```

### 4. Limit Result Sets

**Good:**
```sql
-- Limit results
SELECT * FROM orders 
ORDER BY order_date DESC 
LIMIT 10;
```

**Bad:**
```sql
-- Fetch all records
SELECT * FROM orders ORDER BY order_date DESC;
```

### 5. Use Appropriate WHERE Clauses

**Good:**
```sql
-- Uses index
SELECT * FROM menu_items 
WHERE category = 'Coffee' AND is_available = true;
```

**Bad:**
```sql
-- Cannot use index effectively
SELECT * FROM menu_items 
WHERE category LIKE '%Coffee%';
```

## SQLAlchemy Optimization

### Eager Loading

**Problem:** N+1 query problem

```python
# Bad: N+1 queries
orders = db.query(Order).all()
for order in orders:
    print(order.customer.name)  # Query for each order
```

**Solution:** Use eager loading

```python
# Good: Single query with JOIN
from sqlalchemy.orm import joinedload

orders = db.query(Order).options(
    joinedload(Order.customer)
).all()
for order in orders:
    print(order.customer.name)  # No additional queries
```

### Selectin Loading

For one-to-many relationships:

```python
from sqlalchemy.orm import selectinload

orders = db.query(Order).options(
    selectinload(Order.order_details)
).all()
```

### Query Optimization in Repository

```python
class OrderRepository:
    def get_all(self, skip: int = 0, limit: int = 100):
        """Optimized query with eager loading"""
        return self.db.query(Order).options(
            joinedload(Order.customer),
            selectinload(Order.order_details).joinedload(OrderDetail.menu_item)
        ).filter(
            Order.is_deleted == False
        ).order_by(
            Order.order_date.desc()
        ).offset(skip).limit(limit).all()
```

## Query Analysis

### EXPLAIN ANALYZE

```sql
-- Analyze query execution plan
EXPLAIN ANALYZE
SELECT o.*, c.name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'pending'
ORDER BY o.order_date DESC
LIMIT 10;
```

**Output Analysis:**
- **Seq Scan** - Full table scan (slow)
- **Index Scan** - Uses index (fast)
- **Hash Join** - Hash join algorithm
- **Nested Loop** - Nested loop join

### Query Performance Metrics

```sql
-- Enable query timing
\timing

-- Run query
SELECT * FROM orders WHERE status = 'pending';

-- Output: Time: 2.345 ms
```

## Physical Storage Optimization

### Table Partitioning

For large tables, consider partitioning:

```sql
-- Partition orders by date
CREATE TABLE orders_2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Vacuum and Analyze

Regular maintenance improves performance:

```sql
-- Vacuum to reclaim storage
VACUUM ANALYZE orders;

-- Full vacuum (requires exclusive lock)
VACUUM FULL orders;
```

### Index Maintenance

```sql
-- Rebuild indexes
REINDEX TABLE orders;

-- Analyze index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Query Patterns

### Pattern 1: Filtered Aggregation

**Optimized:**
```sql
SELECT 
    category,
    COUNT(*) as count,
    AVG(price) as avg_price
FROM menu_items
WHERE is_available = true
GROUP BY category
HAVING COUNT(*) > 5;
```

### Pattern 2: Pagination

**Optimized:**
```sql
SELECT * FROM orders
ORDER BY order_date DESC
LIMIT 20 OFFSET 0;

-- Use cursor-based pagination for large datasets
SELECT * FROM orders
WHERE order_date < '2024-01-01'
ORDER BY order_date DESC
LIMIT 20;
```

### Pattern 3: Existence Check

**Optimized:**
```sql
-- Use EXISTS instead of COUNT
SELECT EXISTS(
    SELECT 1 FROM orders 
    WHERE customer_id = 123
);
```

**Less Optimal:**
```sql
-- Counts all rows
SELECT COUNT(*) FROM orders WHERE customer_id = 123;
```

## Performance Monitoring

### Slow Query Log

Enable in `postgresql.conf`:

```conf
log_min_duration_statement = 1000  # Log queries > 1 second
```

### Query Statistics

```sql
-- View query statistics
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## Best Practices

1. **Use Indexes** - Index frequently queried columns
2. **Avoid SELECT *** - Select only needed columns
3. **Use LIMIT** - Limit result sets
4. **Optimize JOINs** - Use appropriate JOIN types
5. **Use EXPLAIN ANALYZE** - Analyze query plans
6. **Regular Maintenance** - VACUUM and ANALYZE regularly
7. **Monitor Performance** - Track slow queries
8. **Use Connection Pooling** - Reuse database connections

## Related Documentation

- [Database Schema](schema.md) - Schema design for optimization
- [Normalization](normalization.md) - Database normalization principles
- [Constraints & Indexes](constraints-indexes.md) - Index creation and usage
- [Migrations](migrations.md) - Database migration guide and version control
- [Transactions](transactions.md) - Transaction performance optimization

