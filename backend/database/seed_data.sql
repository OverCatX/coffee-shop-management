-- Coffee Shop Management Database Seed Data
-- This file contains sample data for testing

-- Insert sample employees
INSERT INTO employees (name, role, salary, email, phone, hire_date) VALUES
    ('John Smith', 'Manager', 50000.00, 'john.smith@coffeeshop.com', '555-0101', '2020-01-15'),
    ('Jane Doe', 'Barista', 30000.00, 'jane.doe@coffeeshop.com', '555-0102', '2021-03-20'),
    ('Bob Johnson', 'Barista', 32000.00, 'bob.johnson@coffeeshop.com', '555-0103', '2021-05-10'),
    ('Alice Williams', 'Barista', 31000.00, 'alice.williams@coffeeshop.com', '555-0104', '2022-01-08')
ON CONFLICT DO NOTHING;

-- Insert managers
INSERT INTO managers (emp_id) 
SELECT emp_id FROM employees WHERE role = 'Manager'
ON CONFLICT DO NOTHING;

-- Insert baristas
INSERT INTO baristas (emp_id) 
SELECT emp_id FROM employees WHERE role = 'Barista'
ON CONFLICT DO NOTHING;

-- Insert sample customers
INSERT INTO customers (name, phone, email, loyalty_points) VALUES
    ('Customer One', '555-1001', 'customer1@example.com', 50.00),
    ('Customer Two', '555-1002', 'customer2@example.com', 25.00),
    ('Customer Three', '555-1003', 'customer3@example.com', 100.00)
ON CONFLICT DO NOTHING;

-- Insert sample ingredients
INSERT INTO ingredients (name, unit) VALUES
    ('Coffee Beans', 'kg'),
    ('Milk', 'liter'),
    ('Sugar', 'kg'),
    ('Vanilla Syrup', 'liter'),
    ('Chocolate Syrup', 'liter'),
    ('Whipped Cream', 'liter'),
    ('Espresso Shot', 'shot'),
    ('Water', 'liter')
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (name, price, category, description, is_available) VALUES
    ('Espresso', 2.50, 'Coffee', 'Single shot of espresso', true),
    ('Americano', 3.00, 'Coffee', 'Espresso with hot water', true),
    ('Cappuccino', 4.50, 'Coffee', 'Espresso with steamed milk and foam', true),
    ('Latte', 4.75, 'Coffee', 'Espresso with steamed milk', true),
    ('Mocha', 5.25, 'Coffee', 'Espresso with chocolate and steamed milk', true),
    ('Hot Chocolate', 3.50, 'Beverage', 'Rich hot chocolate', true),
    ('Green Tea', 2.75, 'Tea', 'Premium green tea', true),
    ('Black Tea', 2.75, 'Tea', 'Classic black tea', true)
ON CONFLICT DO NOTHING;

-- Insert menu item ingredients
INSERT INTO menu_item_ingredients (item_id, ingredient_id, amount_required, unit) VALUES
    ((SELECT item_id FROM menu_items WHERE name = 'Espresso'), (SELECT ingredient_id FROM ingredients WHERE name = 'Coffee Beans'), 0.02, 'kg'),
    ((SELECT item_id FROM menu_items WHERE name = 'Espresso'), (SELECT ingredient_id FROM ingredients WHERE name = 'Water'), 0.03, 'liter'),
    ((SELECT item_id FROM menu_items WHERE name = 'Americano'), (SELECT ingredient_id FROM ingredients WHERE name = 'Coffee Beans'), 0.02, 'kg'),
    ((SELECT item_id FROM menu_items WHERE name = 'Americano'), (SELECT ingredient_id FROM ingredients WHERE name = 'Water'), 0.15, 'liter'),
    ((SELECT item_id FROM menu_items WHERE name = 'Cappuccino'), (SELECT ingredient_id FROM ingredients WHERE name = 'Coffee Beans'), 0.02, 'kg'),
    ((SELECT item_id FROM menu_items WHERE name = 'Cappuccino'), (SELECT ingredient_id FROM ingredients WHERE name = 'Milk'), 0.12, 'liter'),
    ((SELECT item_id FROM menu_items WHERE name = 'Latte'), (SELECT ingredient_id FROM ingredients WHERE name = 'Coffee Beans'), 0.02, 'kg'),
    ((SELECT item_id FROM menu_items WHERE name = 'Latte'), (SELECT ingredient_id FROM ingredients WHERE name = 'Milk'), 0.20, 'liter'),
    ((SELECT item_id FROM menu_items WHERE name = 'Mocha'), (SELECT ingredient_id FROM ingredients WHERE name = 'Coffee Beans'), 0.02, 'kg'),
    ((SELECT item_id FROM menu_items WHERE name = 'Mocha'), (SELECT ingredient_id FROM ingredients WHERE name = 'Milk'), 0.18, 'liter'),
    ((SELECT item_id FROM menu_items WHERE name = 'Mocha'), (SELECT ingredient_id FROM ingredients WHERE name = 'Chocolate Syrup'), 0.05, 'liter')
ON CONFLICT DO NOTHING;

-- Insert barista menu items (which items each barista can make)
INSERT INTO barista_menu_items (barista_id, item_id, proficiency_level) VALUES
    ((SELECT emp_id FROM baristas WHERE emp_id = (SELECT emp_id FROM employees WHERE name = 'Jane Doe')), (SELECT item_id FROM menu_items WHERE name = 'Espresso'), 'advanced'),
    ((SELECT emp_id FROM baristas WHERE emp_id = (SELECT emp_id FROM employees WHERE name = 'Jane Doe')), (SELECT item_id FROM menu_items WHERE name = 'Cappuccino'), 'advanced'),
    ((SELECT emp_id FROM baristas WHERE emp_id = (SELECT emp_id FROM employees WHERE name = 'Jane Doe')), (SELECT item_id FROM menu_items WHERE name = 'Latte'), 'intermediate'),
    ((SELECT emp_id FROM baristas WHERE emp_id = (SELECT emp_id FROM employees WHERE name = 'Bob Johnson')), (SELECT item_id FROM menu_items WHERE name = 'Espresso'), 'intermediate'),
    ((SELECT emp_id FROM baristas WHERE emp_id = (SELECT emp_id FROM employees WHERE name = 'Bob Johnson')), (SELECT item_id FROM menu_items WHERE name = 'Americano'), 'advanced'),
    ((SELECT emp_id FROM baristas WHERE emp_id = (SELECT emp_id FROM employees WHERE name = 'Alice Williams')), (SELECT item_id FROM menu_items WHERE name = 'Mocha'), 'advanced'),
    ((SELECT emp_id FROM baristas WHERE emp_id = (SELECT emp_id FROM employees WHERE name = 'Alice Williams')), (SELECT item_id FROM menu_items WHERE name = 'Hot Chocolate'), 'advanced')
ON CONFLICT DO NOTHING;

-- Insert inventory
INSERT INTO inventory (ingredient_id, quantity, min_threshold, employee_id) VALUES
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Coffee Beans'), 50.00, 10.00, (SELECT emp_id FROM employees WHERE role = 'Manager')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Milk'), 30.00, 5.00, (SELECT emp_id FROM employees WHERE role = 'Manager')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Sugar'), 20.00, 3.00, (SELECT emp_id FROM employees WHERE role = 'Manager')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Vanilla Syrup'), 10.00, 2.00, (SELECT emp_id FROM employees WHERE role = 'Manager')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Chocolate Syrup'), 8.00, 2.00, (SELECT emp_id FROM employees WHERE role = 'Manager')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Whipped Cream'), 5.00, 1.00, (SELECT emp_id FROM employees WHERE role = 'Manager')),
    ((SELECT ingredient_id FROM ingredients WHERE name = 'Water'), 100.00, 20.00, (SELECT emp_id FROM employees WHERE role = 'Manager'))
ON CONFLICT DO NOTHING;

