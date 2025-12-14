# Business Analysis

This document explains the business domain, activities, processes, and why data collection and management is necessary for the Coffee Shop Management System.

## Business Domain

**Coffee Shop Management System (POS)** - A comprehensive Point of Sale and management system designed for coffee shops to manage daily operations, including orders, inventory, menu items, employees, customers, and business analytics.

## Business Activities and Processes

### 1. Point of Sale (POS) Operations

**Activities:**

- Create new orders for customers
- Add menu items to orders
- Calculate order totals
- Process payments (cash, card, loyalty points)
- Print receipts

**Why Data Collection is Necessary:**

- **INSERT:** Need to store order information (`orders` table) and order line items (`order_details` table) to track what was sold, when, and for how much
- **UPDATE:** Need to update order status (pending → completed → cancelled) to track order lifecycle
- **USE:** Query orders to calculate daily revenue, track popular items, and analyze sales patterns

**Data Requirements:**

- Order details (items, quantities, prices)
- Customer information (for loyalty points and order history)
- Payment information (method, amount, status)
- Timestamps (for reporting and analytics)

### 2. Order Management

**Activities:**

- View pending orders
- Track order status (pending, in-progress, completed, cancelled)
- Update order status
- View order history
- Handle order cancellations

**Why Data Collection is Necessary:**

- **INSERT:** Create order records when customers place orders
- **UPDATE:** Change order status as orders progress through the system (pending → completed)
- **DELETE:** Soft delete cancelled orders (maintain history but mark as deleted)
- **USE:** Query orders by status to display pending orders to baristas, calculate completion rates, and track order processing times

**Data Requirements:**

- Order status tracking
- Order timestamps (created_at, updated_at)
- Order relationships (customer, items, payment)

### 3. Inventory Management

**Activities:**

- Track ingredient stock levels
- Update inventory when ingredients are used
- Set minimum stock thresholds
- Receive low stock alerts
- Record inventory updates (who updated, when)

**Why Data Collection is Necessary:**

- **INSERT:** Add new ingredients to inventory when received
- **UPDATE:** Update ingredient quantities when used in orders or restocked
- **USE:** Query inventory levels to check if ingredients are available before accepting orders, generate low stock alerts, and track ingredient usage patterns

**Data Requirements:**

- Current stock quantities
- Minimum thresholds for alerts
- Ingredient usage tracking
- Update history (who, when)

### 4. Menu Management

**Activities:**

- Add new menu items
- Update menu item prices
- Set item availability (available/unavailable)
- Organize items by category
- Define recipes (ingredients needed for each item)

**Why Data Collection is Necessary:**

- **INSERT:** Add new menu items with prices, categories, and descriptions
- **UPDATE:** Change prices, availability status, or item details
- **DELETE:** Soft delete discontinued items (maintain history)
- **USE:** Query menu items to display menu to customers, check availability, calculate costs based on ingredient prices, and analyze popular items

**Data Requirements:**

- Menu item details (name, price, category, description)
- Availability status
- Recipe information (ingredients and amounts required)

### 5. Customer Management

**Activities:**

- Register new customers
- Search customers by name, phone, or email
- Update customer information
- Track customer loyalty points
- View customer order history

**Why Data Collection is Necessary:**

- **INSERT:** Create customer records when new customers register
- **UPDATE:** Update customer information (name, phone, email) and loyalty points
- **DELETE:** Soft delete customer records (maintain order history)
- **USE:** Query customers to find existing customers during checkout, track loyalty points, view purchase history, and identify top customers

**Data Requirements:**

- Customer contact information (name, phone, email)
- Loyalty points balance
- Order history linkage

### 6. Employee Management

**Activities:**

- Register new employees
- Assign roles (Manager, Barista, Cashier)
- Track employee information (salary, hire date)
- Employee authentication and authorization
- View employee list

**Why Data Collection is Necessary:**

- **INSERT:** Add new employees with roles and credentials
- **UPDATE:** Update employee information, roles, or salaries
- **DELETE:** Soft delete employee records (maintain order history)
- **USE:** Query employees for authentication (login), authorization (check role permissions), and track who created/updated orders

**Data Requirements:**

- Employee credentials (email, password hash)
- Role information (for access control)
- Employee details (name, salary, hire date)

### 7. Recipe Management

**Activities:**

- Define which ingredients are needed for each menu item
- Specify amounts required for each ingredient
- Update recipes
- Check if ingredients are available for a menu item

**Why Data Collection is Necessary:**

- **INSERT:** Create recipe records linking menu items to ingredients
- **UPDATE:** Modify ingredient amounts in recipes
- **DELETE:** Remove ingredients from recipes
- **USE:** Query recipes to calculate menu item costs, check ingredient availability before accepting orders, and generate ingredient usage reports

**Data Requirements:**

- Menu item to ingredient relationships
- Amount required for each ingredient
- Unit of measurement

### 8. Payment Processing

**Activities:**

- Record payment method (cash, card, loyalty points)
- Track payment status (pending, completed, failed)
- Link payments to orders
- Process refunds

**Why Data Collection is Necessary:**

- **INSERT:** Create payment records when orders are paid
- **UPDATE:** Update payment status (pending → completed)
- **USE:** Query payments to calculate revenue by payment method, track payment success rates, and generate financial reports

**Data Requirements:**

- Payment method
- Payment amount
- Payment status
- Order linkage

### 9. Stock Availability Checking

**Activities:**

- Check if ingredients are available before accepting orders
- Verify stock levels meet minimum requirements
- Calculate if enough ingredients exist for menu items

**Why Data Collection is Necessary:**

- **USE:** Query inventory levels and recipes to determine if orders can be fulfilled, prevent overselling, and ensure quality control

**Data Requirements:**

- Current inventory quantities
- Recipe requirements
- Minimum thresholds

### 10. Loyalty Points System

**Activities:**

- Award points to customers based on purchases
- Redeem points for discounts
- Track point balances
- View point history

**Why Data Collection is Necessary:**

- **UPDATE:** Increase loyalty points when customers make purchases
- **UPDATE:** Decrease loyalty points when customers redeem points
- **USE:** Query loyalty points to display customer balances, calculate rewards, and identify top customers

**Data Requirements:**

- Customer loyalty point balances
- Point transaction history

## Summary: Data Operations by Activity

| Activity             | INSERT                          | UPDATE                        | DELETE                | USE (Query)                           |
| -------------------- | ------------------------------- | ----------------------------- | --------------------- | ------------------------------------- |
| POS Operations       | Orders, Order Details, Payments | Order Status                  | -                     | Menu Items, Customers, Inventory      |
| Order Management     | Orders                          | Order Status                  | Soft Delete Orders    | Orders by Status, Order History       |
| Inventory Management | Inventory Records               | Stock Quantities              | -                     | Stock Levels, Low Stock Alerts        |
| Menu Management      | Menu Items, Recipes             | Prices, Availability          | Soft Delete Items     | Menu Items, Recipes                   |
| Customer Management  | Customers                       | Customer Info, Loyalty Points | Soft Delete Customers | Customer Search, Order History        |
| Employee Management  | Employees                       | Employee Info, Roles          | Soft Delete Employees | Authentication, Authorization         |
| Recipe Management    | Recipe Links                    | Ingredient Amounts            | Recipe Links          | Recipe Lookup, Cost Calculation       |
| Payment Processing   | Payments                        | Payment Status                | -                     | Revenue Reports, Payment Methods      |
| Stock Availability   | -                               | -                             | -                     | Inventory Levels, Recipe Requirements |
| Loyalty Points       | -                               | Point Balances                | -                     | Point Balances, Top Customers         |

## Data Flow Example: Creating an Order

1. **Customer Selection:** Query `customers` table to find or create customer
2. **Menu Display:** Query `menu_items` table to show available items
3. **Stock Check:** Query `inventory` and `menu_item_ingredients` to verify ingredient availability
4. **Order Creation:** INSERT into `orders` table
5. **Order Details:** INSERT into `order_details` table for each item
6. **Payment:** INSERT into `payments` table
7. **Loyalty Points:** UPDATE `customers.loyalty_points`
8. **Inventory Update:** UPDATE `inventory.quantity` for used ingredients

## Related Documentation

- [Database Schema](database/schema.md) - Complete database structure, constraints, and indexes
- [Normalization](database/normalization.md) - Database normalization and functional dependencies
- [Query Optimization](database/query-optimization.md) - Query optimization techniques and SQL queries
