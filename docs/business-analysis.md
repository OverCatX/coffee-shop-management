# Business Analysis

This document explains the business domain, activities, processes, and why data collection and management is necessary for the Coffee Shop Management System.

## 1. Business Domain Selection

**Coffee Shop Management System (POS)** - A comprehensive Point of Sale and management system designed for coffee shops to manage daily operations, including orders, inventory, menu items, employees, customers, and business analytics.

---

## 2. Business Activities and Processes

### 1. Point of Sale (POS) Operations

**Activities:** Create orders, add items, calculate totals, process payments, print receipts

**Data Operations:**

- **INSERT:** Store orders (`orders`), order items (`order_details`), and payments (`payments`)
- **UPDATE:** Update order status (pending → completed)
- **USE:** Query menu items for display, calculate revenue, track sales patterns

### 2. Order Management

**Activities:** View pending orders, track status, update status, view history, handle cancellations

**Data Operations:**

- **INSERT:** Create order records when customers place orders
- **UPDATE:** Change order status (pending → completed → cancelled)
- **DELETE:** Soft delete cancelled orders (maintain history)
- **USE:** Query orders by status, calculate completion rates, track processing times

### 3. Inventory Management

**Activities:** Track stock levels, update inventory, set thresholds, receive low stock alerts

**Data Operations:**

- **INSERT:** Add new ingredients to inventory
- **UPDATE:** Update quantities when used or restocked
- **USE:** Query inventory levels, generate low stock alerts, track usage patterns

### 4. Menu Management

**Activities:** Add menu items, update prices, set availability, organize by category, define recipes

**Data Operations:**

- **INSERT:** Add menu items and recipes (ingredient links)
- **UPDATE:** Change prices, availability, or item details
- **DELETE:** Soft delete discontinued items
- **USE:** Query menu items for display, check availability, calculate costs, analyze popular items

### 5. Customer Management

**Activities:** Register customers, search customers, update information, track loyalty points, view order history

**Data Operations:**

- **INSERT:** Create customer records
- **UPDATE:** Update customer information and loyalty points
- **DELETE:** Soft delete customer records (maintain order history)
- **USE:** Query customers during checkout, track loyalty points, view purchase history

### 6. Employee Management

**Activities:** Register employees, assign roles, track information, authentication and authorization

**Data Operations:**

- **INSERT:** Add employees with roles and credentials
- **UPDATE:** Update employee information, roles, or salaries
- **DELETE:** Soft delete employee records (maintain order history)
- **USE:** Query for authentication (login), authorization (check permissions), track who created orders

### 7. Recipe Management

**Activities:** Define ingredient requirements, specify amounts, update recipes, check availability

**Data Operations:**

- **INSERT:** Create recipe records linking menu items to ingredients
- **UPDATE:** Modify ingredient amounts in recipes
- **DELETE:** Remove ingredients from recipes
- **USE:** Query recipes to calculate costs, check ingredient availability, generate usage reports

### 8. Payment Processing

**Activities:** Record payment method, track status, link to orders, process refunds

**Data Operations:**

- **INSERT:** Create payment records when orders are paid
- **UPDATE:** Update payment status (pending → completed)
- **USE:** Query payments to calculate revenue by method, track success rates, generate financial reports

### 9. Stock Availability Checking

**Activities:** Check ingredient availability, verify stock levels, calculate if enough ingredients exist

**Data Operations:**

- **USE:** Query inventory levels and recipes to determine if orders can be fulfilled, prevent overselling

### 10. Loyalty Points System

**Activities:** Award points, redeem points, track balances, view point history

**Data Operations:**

- **UPDATE:** Increase points on purchases, decrease points on redemption
- **USE:** Query loyalty points to display balances, calculate rewards, identify top customers

---

## 3. Summary: Why Data Collection and Management is Necessary

Each business activity requires data operations to function:

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

**Key Points:**

- **INSERT** operations are needed to store new transactions, records, and relationships
- **UPDATE** operations are needed to modify existing data (status changes, quantity updates, price changes)
- **DELETE** operations use soft delete (mark as deleted) to maintain historical data integrity
- **USE** (Query) operations are needed to retrieve data for display, analysis, decision-making, and reporting

---

## Related Documentation

- [Database Schema](database/schema.md) - Complete database structure, constraints, and indexes
- [Normalization](database/normalization.md) - Database normalization and functional dependencies
- [User Actions & Queries](database/user-actions-queries.md) - Specific SQL queries users can perform
- [Query Optimization](database/query-optimization.md) - Query optimization techniques and SQL queries
