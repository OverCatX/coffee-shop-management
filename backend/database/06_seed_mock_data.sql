-- Seed database with mock data from frontend
-- This file contains SQL INSERT statements for mock data
-- Note: Passwords need to be hashed using bcrypt before inserting
-- Use the Python script (scripts/seed_mock_data.py) instead for proper password hashing

-- Clear existing data (optional - be careful!)
-- TRUNCATE TABLE order_details, orders, inventory, menu_items, customers, employees CASCADE;

-- Insert Employees (with password_hash - these are example hashes for "password123")
-- In production, use the Python script to generate proper bcrypt hashes
INSERT INTO employees (name, role, salary, email, phone, hire_date, password_hash) VALUES
    ('John Smith', 'Manager', 35000.00, 'john.smith@coffeeshop.com', '081-234-5678', '2023-01-15', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJZ5q5Z5O'),
    ('Sarah Johnson', 'Barista', 25000.00, 'sarah.j@coffeeshop.com', '082-345-6789', '2023-03-20', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJZ5q5Z5O'),
    ('Mike Chen', 'Barista', 25000.00, 'mike.chen@coffeeshop.com', '083-456-7890', '2023-05-10', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJZ5q5Z5O'),
    ('Emma Wilson', 'Cashier', 22000.00, 'emma.w@coffeeshop.com', '084-567-8901', '2023-07-01', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJZ5q5Z5O')
ON CONFLICT (email) DO NOTHING;

-- Insert Customers
INSERT INTO customers (name, phone, email, loyalty_points) VALUES
    ('Alice Brown', '085-111-2222', 'alice.brown@email.com', 150.00),
    ('Bob Davis', '086-222-3333', 'bob.davis@email.com', 320.00),
    ('Carol White', '087-333-4444', 'carol.white@email.com', 75.00),
    ('David Lee', '088-444-5555', NULL, 500.00)
ON CONFLICT DO NOTHING;

-- Insert Ingredients
INSERT INTO ingredients (name, unit) VALUES
    ('Coffee Beans', 'kg'),
    ('Milk', 'liter'),
    ('Sugar', 'kg'),
    ('Vanilla Syrup', 'liter'),
    ('Chocolate Syrup', 'liter')
ON CONFLICT (name) DO NOTHING;

-- Insert Menu Items
INSERT INTO menu_items (name, price, category, description, is_available) VALUES
    ('Espresso', 60.00, 'Coffee', 'Rich and bold espresso shot', true),
    ('Cappuccino', 80.00, 'Coffee', 'Espresso with steamed milk and foam', true),
    ('Latte', 85.00, 'Coffee', 'Smooth espresso with steamed milk', true),
    ('Americano', 70.00, 'Coffee', 'Espresso with hot water', true),
    ('Mocha', 95.00, 'Coffee', 'Chocolate espresso with steamed milk', true),
    ('Green Tea', 65.00, 'Non-Coffee', 'Refreshing green tea', true),
    ('Matcha Latte', 90.00, 'Non-Coffee', 'Creamy matcha with steamed milk', true),
    ('Chocolate Cake', 120.00, 'Bakery', 'Rich chocolate cake slice', true),
    ('Croissant', 55.00, 'Bakery', 'Buttery French croissant', true),
    ('Blueberry Muffin', 65.00, 'Bakery', 'Fresh blueberry muffin', false)
ON CONFLICT (name) DO NOTHING;

-- Insert Inventory
INSERT INTO inventory (ingredient_id, quantity, min_threshold, employee_id) VALUES
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Coffee Beans'), 50.5, 20.0, (SELECT emp_id FROM employees WHERE email = 'john.smith@coffeeshop.com')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Milk'), 15.0, 20.0, (SELECT emp_id FROM employees WHERE email = 'john.smith@coffeeshop.com')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Sugar'), 100.0, 30.0, (SELECT emp_id FROM employees WHERE email = 'john.smith@coffeeshop.com')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Vanilla Syrup'), 8.5, 10.0, (SELECT emp_id FROM employees WHERE email = 'john.smith@coffeeshop.com')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Chocolate Syrup'), 200.0, 50.0, (SELECT emp_id FROM employees WHERE email = 'john.smith@coffeeshop.com'))
ON CONFLICT DO NOTHING;

-- Insert Orders (using current date and yesterday)
INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES
    ((SELECT customer_id FROM customers WHERE email = 'alice.brown@email.com'), CURRENT_DATE, 240.00, 'pending'),
    ((SELECT customer_id FROM customers WHERE email = 'bob.davis@email.com'), CURRENT_DATE, 190.00, 'completed'),
    (NULL, CURRENT_DATE, 170.00, 'pending'),
    ((SELECT customer_id FROM customers WHERE email = 'carol.white@email.com'), CURRENT_DATE - INTERVAL '1 day', 95.00, 'completed')
ON CONFLICT DO NOTHING;

-- Insert Order Details
-- Order 1
INSERT INTO order_details (order_id, item_id, quantity, unit_price, subtotal) VALUES
    ((SELECT order_id FROM orders WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'alice.brown@email.com') AND order_date = CURRENT_DATE LIMIT 1),
     (SELECT item_id FROM menu_items WHERE name = 'Espresso'), 2, 60.00, 120.00),
    ((SELECT order_id FROM orders WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'alice.brown@email.com') AND order_date = CURRENT_DATE LIMIT 1),
     (SELECT item_id FROM menu_items WHERE name = 'Chocolate Cake'), 1, 120.00, 120.00)
ON CONFLICT DO NOTHING;

-- Order 2
INSERT INTO order_details (order_id, item_id, quantity, unit_price, subtotal) VALUES
    ((SELECT order_id FROM orders WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'bob.davis@email.com') AND order_date = CURRENT_DATE LIMIT 1),
     (SELECT item_id FROM menu_items WHERE name = 'Cappuccino'), 1, 80.00, 80.00),
    ((SELECT order_id FROM orders WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'bob.davis@email.com') AND order_date = CURRENT_DATE LIMIT 1),
     (SELECT item_id FROM menu_items WHERE name = 'Croissant'), 2, 55.00, 110.00)
ON CONFLICT DO NOTHING;

-- Order 3 (no customer)
INSERT INTO order_details (order_id, item_id, quantity, unit_price, subtotal) VALUES
    ((SELECT order_id FROM orders WHERE customer_id IS NULL AND order_date = CURRENT_DATE LIMIT 1),
     (SELECT item_id FROM menu_items WHERE name = 'Latte'), 2, 85.00, 170.00)
ON CONFLICT DO NOTHING;

-- Order 4 (yesterday)
INSERT INTO order_details (order_id, item_id, quantity, unit_price, subtotal) VALUES
    ((SELECT order_id FROM orders WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'carol.white@email.com') AND order_date = CURRENT_DATE - INTERVAL '1 day' LIMIT 1),
     (SELECT item_id FROM menu_items WHERE name = 'Mocha'), 1, 95.00, 95.00)
ON CONFLICT DO NOTHING;

