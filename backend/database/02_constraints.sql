-- Coffee Shop Management Database Constraints
-- This file contains all check constraints and data validation rules

-- Employees constraints
ALTER TABLE employees
    ADD CONSTRAINT check_salary_positive CHECK (salary > 0);

-- Menu items constraints
ALTER TABLE menu_items
    ADD CONSTRAINT check_price_positive CHECK (price > 0);

-- Inventory constraints
ALTER TABLE inventory
    ADD CONSTRAINT check_quantity_non_negative CHECK (quantity >= 0),
    ADD CONSTRAINT check_threshold_non_negative CHECK (min_threshold >= 0);

-- Orders constraints
ALTER TABLE orders
    ADD CONSTRAINT check_total_amount_non_negative CHECK (total_amount >= 0),
    ADD CONSTRAINT check_order_status CHECK (status IN ('pending', 'completed', 'cancelled'));

-- Order details constraints
ALTER TABLE order_details
    ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0),
    ADD CONSTRAINT check_unit_price_non_negative CHECK (unit_price >= 0),
    ADD CONSTRAINT check_subtotal_non_negative CHECK (subtotal >= 0);

-- Payments constraints
ALTER TABLE payments
    ADD CONSTRAINT check_payment_amount_positive CHECK (amount > 0),
    ADD CONSTRAINT check_payment_status CHECK (status IN ('pending', 'completed', 'failed'));

-- Barista menu items constraints
ALTER TABLE barista_menu_items
    ADD CONSTRAINT check_proficiency_level CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced'));

-- Menu item ingredients constraints
ALTER TABLE menu_item_ingredients
    ADD CONSTRAINT check_amount_required_positive CHECK (amount_required > 0);

