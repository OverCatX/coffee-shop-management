# User Actions and Queries

This document lists specific SQL queries that users might want to perform in the Coffee Shop Management System. These queries correspond to the business activities and processes described in the Business Analysis document.

**Note:** `<parameter>` indicates where user input is expected. Replace with actual values when executing queries.

**Group Size:** 4 people  
**Minimum Required:** 3N = 12 queries  
**Total Provided:** 30+ queries

---

## 1. Employee Management Queries

### Get employee by email (for login)

```sql
SELECT emp_id, name, email, role, password_hash
FROM employees
WHERE email = '<email>' AND is_deleted = FALSE;
```

### Get all employees

```sql
SELECT emp_id, name, role, email, phone, hire_date, salary
FROM employees
WHERE is_deleted = FALSE
ORDER BY name;
```

### Get employee by ID

```sql
SELECT * FROM employees
WHERE emp_id = <emp_id> AND is_deleted = FALSE;
```

### Create new employee

```sql
INSERT INTO employees (name, role, salary, email, phone, hire_date, password_hash)
VALUES ('<name>', '<role>', <salary>, '<email>', '<phone>', '<hire_date>', '<password_hash>');
```

### Update employee information

```sql
UPDATE employees
SET name = '<name>', email = '<email>', phone = '<phone>', salary = <salary>, updated_at = NOW()
WHERE emp_id = <emp_id> AND is_deleted = FALSE;
```

### Get employees by role

```sql
SELECT emp_id, name, email, phone, hire_date, salary
FROM employees
WHERE role = '<role>' AND is_deleted = FALSE
ORDER BY name;
```

---

## 2. Customer Management Queries

### Get customer by ID

```sql
SELECT * FROM customers
WHERE customer_id = <customer_id> AND is_deleted = FALSE;
```

### Search customers by name

```sql
SELECT customer_id, name, phone, email, loyalty_points
FROM customers
WHERE name ILIKE '%<search_term>%' AND is_deleted = FALSE
ORDER BY name;
```

### Search customers by phone

```sql
SELECT customer_id, name, phone, email, loyalty_points
FROM customers
WHERE phone = '<phone>' AND is_deleted = FALSE;
```

### Create new customer

```sql
INSERT INTO customers (name, phone, email, loyalty_points)
VALUES ('<name>', '<phone>', '<email>', <loyalty_points>);
```

### Update customer information

```sql
UPDATE customers
SET name = '<name>', phone = '<phone>', email = '<email>', updated_at = NOW()
WHERE customer_id = <customer_id> AND is_deleted = FALSE;
```

### Update customer loyalty points

```sql
UPDATE customers
SET loyalty_points = <new_points>, updated_at = NOW()
WHERE customer_id = <customer_id> AND is_deleted = FALSE;
```

---

## 3. Menu Item Management Queries

### Get all menu items

```sql
SELECT item_id, name, price, category, description, is_available
FROM menu_items
WHERE is_deleted = FALSE
ORDER BY category, name;
```

### Get menu item by ID

```sql
SELECT * FROM menu_items
WHERE item_id = <item_id> AND is_deleted = FALSE;
```

### Get menu items by category

```sql
SELECT item_id, name, price, description
FROM menu_items
WHERE category = '<category>' AND is_available = TRUE AND is_deleted = FALSE
ORDER BY name;
```

### Get available menu items only

```sql
SELECT item_id, name, price, category, description
FROM menu_items
WHERE is_available = TRUE AND is_deleted = FALSE
ORDER BY category, name;
```

### Create new menu item

```sql
INSERT INTO menu_items (name, price, category, description, is_available)
VALUES ('<name>', <price>, '<category>', '<description>', <is_available>);
```

### Update menu item price

```sql
UPDATE menu_items
SET price = <new_price>, updated_at = NOW()
WHERE item_id = <item_id> AND is_deleted = FALSE;
```

### Update menu item availability

```sql
UPDATE menu_items
SET is_available = <is_available>, updated_at = NOW()
WHERE item_id = <item_id> AND is_deleted = FALSE;
```

### Delete menu item (soft delete)

```sql
UPDATE menu_items
SET is_deleted = TRUE, updated_at = NOW()
WHERE item_id = <item_id>;
```

---

## 4. Order Management Queries

### Get order by ID

```sql
SELECT o.*, c.name AS customer_name, c.phone AS customer_phone
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_id = <order_id> AND o.is_deleted = FALSE;
```

### Get orders by status

```sql
SELECT o.order_id, o.order_date, o.total_amount, c.name AS customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = '<status>' AND o.is_deleted = FALSE
ORDER BY o.created_at DESC;
```

### Get all orders

```sql
SELECT o.order_id, o.order_date, o.total_amount, o.status, c.name AS customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE o.is_deleted = FALSE
ORDER BY o.order_date DESC;
```

### Create new order

```sql
INSERT INTO orders (customer_id, order_date, total_amount, status)
VALUES (<customer_id>, '<order_date>', <total_amount>, '<status>')
RETURNING order_id;
```

### Add item to order

```sql
INSERT INTO order_details (order_id, item_id, quantity, unit_price, subtotal)
VALUES (<order_id>, <item_id>, <quantity>, <unit_price>, <subtotal>);
```

### Get order details (items in order)

```sql
SELECT od.*, mi.name AS item_name, mi.category
FROM order_details od
JOIN menu_items mi ON od.item_id = mi.item_id
WHERE od.order_id = <order_id> AND od.is_deleted = FALSE;
```

### Update order status

```sql
UPDATE orders
SET status = '<new_status>', updated_at = NOW()
WHERE order_id = <order_id> AND is_deleted = FALSE;
```

### Cancel order (soft delete)

```sql
UPDATE orders
SET status = 'cancelled', updated_at = NOW()
WHERE order_id = <order_id> AND is_deleted = FALSE;
```

---

## 5. Inventory Management Queries

### Get all inventory items

```sql
SELECT i.*, ing.name AS ingredient_name, ing.unit
FROM inventory i
JOIN ingredients ing ON i.ingredient_id = ing.ingredient_id
WHERE i.is_deleted = FALSE
ORDER BY ing.name;
```

### Get inventory by ingredient ID

```sql
SELECT i.*, ing.name AS ingredient_name, ing.unit
FROM inventory i
JOIN ingredients ing ON i.ingredient_id = ing.ingredient_id
WHERE i.ingredient_id = <ingredient_id> AND i.is_deleted = FALSE;
```

### Get low stock items

```sql
SELECT i.inventory_id, ing.name AS ingredient_name, ing.unit, i.quantity, i.min_threshold
FROM inventory i
JOIN ingredients ing ON i.ingredient_id = ing.ingredient_id
WHERE i.quantity <= i.min_threshold AND i.is_deleted = FALSE
ORDER BY (i.quantity - i.min_threshold) ASC;
```

### Update inventory quantity

```sql
UPDATE inventory
SET quantity = <new_quantity>, employee_id = <employee_id>, last_updated = NOW(), updated_at = NOW()
WHERE ingredient_id = <ingredient_id> AND is_deleted = FALSE;
```

### Set minimum threshold

```sql
UPDATE inventory
SET min_threshold = <min_threshold>, updated_at = NOW()
WHERE ingredient_id = <ingredient_id> AND is_deleted = FALSE;
```

---

## 6. Recipe Management Queries

### Get recipe for menu item

```sql
SELECT mi.name AS menu_item, ing.name AS ingredient, mii.amount_required, mii.unit
FROM menu_item_ingredients mii
JOIN menu_items mi ON mii.item_id = mi.item_id
JOIN ingredients ing ON mii.ingredient_id = ing.ingredient_id
WHERE mii.item_id = <item_id> AND mii.is_deleted = FALSE;
```

### Create recipe (link menu item to ingredient)

```sql
INSERT INTO menu_item_ingredients (item_id, ingredient_id, amount_required, unit)
VALUES (<item_id>, <ingredient_id>, <amount_required>, '<unit>');
```

### Update recipe (change ingredient amount)

```sql
UPDATE menu_item_ingredients
SET amount_required = <new_amount>, updated_at = NOW()
WHERE item_id = <item_id> AND ingredient_id = <ingredient_id> AND is_deleted = FALSE;
```

### Delete ingredient from recipe

```sql
UPDATE menu_item_ingredients
SET is_deleted = TRUE, updated_at = NOW()
WHERE item_id = <item_id> AND ingredient_id = <ingredient_id>;
```

### Check if ingredients available for menu item

```sql
SELECT mii.ingredient_id, ing.name, mii.amount_required, i.quantity,
       CASE WHEN i.quantity >= mii.amount_required THEN TRUE ELSE FALSE END AS is_available
FROM menu_item_ingredients mii
JOIN ingredients ing ON mii.ingredient_id = ing.ingredient_id
LEFT JOIN inventory i ON mii.ingredient_id = i.ingredient_id AND i.is_deleted = FALSE
WHERE mii.item_id = <item_id> AND mii.is_deleted = FALSE;
```

---

## 7. Payment Processing Queries

### Create payment record

```sql
INSERT INTO payments (order_id, payment_method, amount, status, payment_date)
VALUES (<order_id>, '<payment_method>', <amount>, '<status>', NOW());
```

### Get payment by order ID

```sql
SELECT * FROM payments
WHERE order_id = <order_id> AND is_deleted = FALSE;
```

### Update payment status

```sql
UPDATE payments
SET status = '<new_status>', updated_at = NOW()
WHERE payment_id = <payment_id> AND is_deleted = FALSE;
```

### Get payments by status

```sql
SELECT p.*, o.order_date, o.total_amount
FROM payments p
JOIN orders o ON p.order_id = o.order_id
WHERE p.status = '<status>' AND p.is_deleted = FALSE
ORDER BY p.payment_date DESC;
```

---

## 8. Analytics & Reporting Queries

### Calculate daily revenue

```sql
SELECT order_date, SUM(total_amount) AS daily_revenue, COUNT(*) AS order_count
FROM orders
WHERE status = 'completed' AND order_date = '<date>' AND is_deleted = FALSE
GROUP BY order_date;
```

### Calculate revenue for date range

```sql
SELECT order_date, SUM(total_amount) AS daily_revenue, COUNT(*) AS order_count
FROM orders
WHERE status = 'completed'
  AND order_date BETWEEN '<start_date>' AND '<end_date>'
  AND is_deleted = FALSE
GROUP BY order_date
ORDER BY order_date;
```

### Get top selling menu items

```sql
SELECT mi.name, mi.category, SUM(od.quantity) AS total_sold, SUM(od.subtotal) AS total_revenue
FROM order_details od
JOIN menu_items mi ON od.item_id = mi.item_id
JOIN orders o ON od.order_id = o.order_id
WHERE o.status = 'completed' AND o.is_deleted = FALSE AND od.is_deleted = FALSE
GROUP BY mi.item_id, mi.name, mi.category
ORDER BY total_sold DESC
LIMIT <limit>;
```

### Get order statistics

```sql
SELECT
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count,
    SUM(total_amount) FILTER (WHERE status = 'completed') AS total_revenue
FROM orders
WHERE is_deleted = FALSE;
```

### View customer order history

```sql
SELECT o.order_id, o.order_date, o.total_amount, o.status
FROM orders o
WHERE o.customer_id = <customer_id> AND o.is_deleted = FALSE
ORDER BY o.order_date DESC;
```

### Get revenue by payment method

```sql
SELECT payment_method, SUM(amount) AS total_revenue, COUNT(*) AS payment_count
FROM payments
WHERE status = 'completed' AND is_deleted = FALSE
GROUP BY payment_method
ORDER BY total_revenue DESC;
```

---

## Summary

**Total Queries:** 30+ queries covering all business activities

**Business Activities Covered:**

- Employee Management (6 queries)
- Customer Management (6 queries)
- Menu Item Management (8 queries)
- Order Management (8 queries)
- Inventory Management (5 queries)
- Recipe Management (5 queries)
- Payment Processing (4 queries)
- Analytics & Reporting (6 queries)

**Query Types:**

- SELECT queries (retrieve data)
- INSERT queries (create records)
- UPDATE queries (modify records)
- DELETE queries (soft delete using UPDATE)

---

## Related Documentation

- [Business Analysis](../business-analysis.md) - Business activities and processes
- [Database Schema](schema.md) - Complete database structure
- [Query Optimization](query-optimization.md) - Query optimization techniques
