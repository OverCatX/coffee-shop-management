-- Coffee Shop Management Database Indexes
-- This file contains all indexes for query optimization

-- Employees indexes
CREATE INDEX IF NOT EXISTS ix_employees_emp_id ON employees(emp_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_employees_email ON employees(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ix_employees_phone ON employees(phone) WHERE phone IS NOT NULL;

-- Managers indexes
CREATE INDEX IF NOT EXISTS ix_managers_emp_id ON managers(emp_id);

-- Baristas indexes
CREATE INDEX IF NOT EXISTS ix_baristas_emp_id ON baristas(emp_id);

-- Customers indexes
CREATE INDEX IF NOT EXISTS ix_customers_customer_id ON customers(customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ix_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customer_phone_email ON customers(phone, email);

-- Ingredients indexes
CREATE INDEX IF NOT EXISTS ix_ingredients_ingredient_id ON ingredients(ingredient_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_ingredients_name ON ingredients(name);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS ix_menu_items_item_id ON menu_items(item_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_menu_items_name ON menu_items(name);
CREATE INDEX IF NOT EXISTS ix_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS ix_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_item_category_available ON menu_items(category, is_available);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS ix_inventory_inventory_id ON inventory(inventory_id);
CREATE INDEX IF NOT EXISTS ix_inventory_ingredient_id ON inventory(ingredient_id);
CREATE INDEX IF NOT EXISTS ix_inventory_employee_id ON inventory(employee_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ingredient_quantity ON inventory(ingredient_id, quantity);

-- Orders indexes
CREATE INDEX IF NOT EXISTS ix_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS ix_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS ix_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_date_status ON orders(order_date, status);
CREATE INDEX IF NOT EXISTS idx_order_customer_date ON orders(customer_id, order_date);

-- Order details indexes
CREATE INDEX IF NOT EXISTS ix_order_details_order_id ON order_details(order_id);
CREATE INDEX IF NOT EXISTS ix_order_details_item_id ON order_details(item_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS ix_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS ix_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS ix_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS ix_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_order_status ON payments(order_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_date_status ON payments(payment_date, status);

-- Barista menu items indexes
CREATE INDEX IF NOT EXISTS ix_barista_menu_items_barista_id ON barista_menu_items(barista_id);
CREATE INDEX IF NOT EXISTS ix_barista_menu_items_item_id ON barista_menu_items(item_id);

-- Menu item ingredients indexes
CREATE INDEX IF NOT EXISTS ix_menu_item_ingredients_item_id ON menu_item_ingredients(item_id);
CREATE INDEX IF NOT EXISTS ix_menu_item_ingredients_ingredient_id ON menu_item_ingredients(ingredient_id);

