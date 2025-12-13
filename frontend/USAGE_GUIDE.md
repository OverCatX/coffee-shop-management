# Coffee Shop Management System - Usage Guide

## 📋 Overview

ระบบ Coffee Shop Management System นี้ถูกออกแบบให้สอดคล้องกับ Database Schema ที่มี Normalization, Constraints, Indexes, และ Transactions เพื่อให้ได้คะแนนเต็มในโปรเจค Database

## 🗄️ Database Schema Overview

### Core Tables:
1. **employees** - ข้อมูลพนักงานทั้งหมด
2. **managers** - ผู้จัดการ (FK → employees)
3. **baristas** - บาริสต้า (FK → employees)
4. **customers** - ข้อมูลลูกค้า
5. **menu_items** - เมนูกาแฟและอาหาร
6. **ingredients** - วัตถุดิบ
7. **menu_item_ingredients** - สูตรเมนู (Junction Table: menu_items ↔ ingredients)
8. **inventory** - สต็อกวัตถุดิบ (FK → ingredients, employees)
9. **orders** - ออเดอร์ (FK → customers)
10. **order_details** - รายละเอียดออเดอร์ (FK → orders, menu_items)
11. **payments** - การชำระเงิน (FK → orders)
12. **barista_menu_items** - ความชำนาญของบาริสต้า (Junction Table: baristas ↔ menu_items)

## 🎯 Features & Database Usage

### 1. POS System (Point of Sale)
**Path:** `/pos` หรือคลิก "POS" ใน Sidebar

**Database Tables Used:**
- `menu_items` - แสดงเมนูที่พร้อมจำหน่าย
- `customers` - ค้นหาหรือเพิ่มลูกค้า
- `orders` - สร้างออเดอร์ใหม่
- `order_details` - บันทึกรายการในออเดอร์
- `payments` - บันทึกการชำระเงิน

**How to Use:**
1. เลือกเมนูจากรายการทางซ้าย
2. เมนูจะถูกเพิ่มลงตะกร้าทางขวา
3. ปรับจำนวนได้ในตะกร้า
4. คลิก "Checkout" เพื่อสร้างออเดอร์
5. ระบบจะสร้าง `orders`, `order_details`, และ `payments` อัตโนมัติ

**Database Operations:**
- **INSERT** into `orders` (status = 'pending')
- **INSERT** into `order_details` (หลาย records ตามจำนวนเมนู)
- **INSERT** into `payments` (payment_method, amount)
- **Transaction** ครอบคลุมทั้ง 3 tables เพื่อความถูกต้องของข้อมูล

---

### 2. Barista View
**Path:** `/barista` หรือคลิก "Barista" ใน Sidebar

**Database Tables Used:**
- `orders` - ดึงออเดอร์ที่ status = 'pending' หรือ 'completed'
- `order_details` - ดูรายการที่ต้องทำ
- `barista_menu_items` - เช็คว่าบาริสต้าทำเมนูนี้ได้หรือไม่

**How to Use:**
1. ดูออเดอร์ที่รอทำ (Pending Orders)
2. คลิก "Start Preparing" เพื่อเริ่มทำ
3. เมื่อเสร็จ คลิก "Complete" เพื่ออัปเดตสถานะ
4. ออเดอร์จะหายไปเมื่อ status = 'completed'

**Database Operations:**
- **SELECT** from `orders` WHERE status IN ('pending', 'completed')
- **SELECT** from `order_details` WHERE order_id = ?
- **UPDATE** `orders` SET status = 'completed' WHERE order_id = ?
- **JOIN** `barista_menu_items` เพื่อเช็คความชำนาญ

---

### 3. Manager Dashboard
**Path:** `/manager` หรือคลิก "Dashboard" ใน Sidebar

**Database Tables Used:**
- `orders` - คำนวณรายได้และจำนวนออเดอร์
- `employees` - นับจำนวนพนักงาน
- `menu_items` - นับจำนวนเมนู
- `inventory` - เช็คสต็อกต่ำ

**How to Use:**
1. ดูสถิติภาพรวม: รายได้วันนี้, ออเดอร์ที่รอ, จำนวนพนักงาน, เมนู
2. แจ้งเตือนสต็อกต่ำ (Low Stock Alert)
3. ดูออเดอร์ล่าสุด 5 รายการ

**Database Operations:**
- **SELECT COUNT**, **SUM** from `orders` WHERE order_date = TODAY
- **SELECT COUNT** from `employees`
- **SELECT COUNT** from `menu_items`
- **SELECT** from `inventory` WHERE quantity < min_threshold

---

### 4. Menu & Recipe Management
**Path:** `/menu` หรือคลิก "Menu" ใน Sidebar

**Database Tables Used:**
- `menu_items` - CRUD เมนู
- `ingredients` - วัตถุดิบ
- `menu_item_ingredients` - สูตรเมนู (Junction Table)

**How to Use:**
1. **Menu Items Tab:**
   - เพิ่มเมนูใหม่: คลิก "Add Menu Item"
   - แก้ไข: คลิกไอคอน Edit
   - ลบ: คลิกไอคอน Trash
   - เปิด/ปิดการจำหน่าย: คลิกไอคอน X/Check

2. **Recipes Tab:**
   - จัดการสูตรเมนู (ต้องมี API สำหรับ `menu_item_ingredients`)
   - กำหนดวัตถุดิบที่ต้องใช้ต่อเมนู
   - ตั้งจำนวนที่ต้องใช้ (amount_required)

**Database Operations:**
- **CRUD** on `menu_items`
- **SELECT** from `menu_item_ingredients` WHERE item_id = ?
- **INSERT/UPDATE/DELETE** on `menu_item_ingredients`
- **JOIN** `ingredients` เพื่อดูชื่อวัตถุดิบ

---

### 5. Inventory Management
**Path:** `/inventory` หรือคลิก "Inventory" ใน Sidebar

**Database Tables Used:**
- `inventory` - สต็อกวัตถุดิบ
- `ingredients` - ข้อมูลวัตถุดิบ
- `employees` - ใครอัปเดตสต็อก

**How to Use:**
1. ดูสต็อกทั้งหมดในตาราง
2. แจ้งเตือนสต็อกต่ำ (Low Stock Alert)
3. อัปเดตจำนวน: คลิก Edit → ใส่จำนวนที่เปลี่ยนแปลง → Save
4. เพิ่มสต็อกใหม่: คลิก "Add Inventory"

**Database Operations:**
- **SELECT** from `inventory` JOIN `ingredients`
- **SELECT** from `inventory` WHERE quantity < min_threshold
- **UPDATE** `inventory` SET quantity = quantity + ? WHERE ingredient_id = ?
- **INSERT** into `inventory` (ingredient_id, quantity, min_threshold, employee_id)
- **CHECK CONSTRAINT**: quantity >= 0, min_threshold >= 0

---

### 6. Employee Management
**Path:** `/employees` หรือคลิก "Employees" ใน Sidebar

**Database Tables Used:**
- `employees` - ข้อมูลพนักงาน
- `managers` - ผู้จัดการ (FK → employees.emp_id)
- `baristas` - บาริสต้า (FK → employees.emp_id)
- `barista_menu_items` - ความชำนาญ (FK → baristas, menu_items)

**How to Use:**
1. เพิ่มพนักงาน: คลิก "Add Employee"
2. แก้ไขข้อมูล: คลิก Edit
3. ลบพนักงาน: คลิก Trash
4. ตั้งเป็น Manager/Barista: ใช้ API `/employees/{id}/manager` หรือ `/employees/{id}/barista`

**Database Operations:**
- **CRUD** on `employees`
- **INSERT** into `managers` (emp_id) - ตั้งเป็น Manager
- **INSERT** into `baristas` (emp_id) - ตั้งเป็น Barista
- **INSERT** into `barista_menu_items` - เพิ่มความชำนาญ
- **CHECK CONSTRAINT**: salary > 0
- **UNIQUE CONSTRAINT**: email, phone

---

### 7. Customer Management
**Path:** `/customers` หรือคลิก "Customers" ใน Sidebar

**Database Tables Used:**
- `customers` - ข้อมูลลูกค้า
- `orders` - ประวัติการซื้อ (FK → customers.customer_id)

**How to Use:**
1. ค้นหาลูกค้า: ใส่ชื่อ, เบอร์, หรืออีเมลในช่องค้นหา
2. เพิ่มลูกค้า: คลิก "Add Customer"
3. แก้ไขข้อมูล: คลิก Edit
4. จัดการแต้มสะสม: แก้ไขในฟอร์ม (loyalty_points)

**Database Operations:**
- **CRUD** on `customers`
- **SELECT** from `customers` WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
- **UPDATE** `customers` SET loyalty_points = loyalty_points + ? WHERE customer_id = ?
- **UNIQUE CONSTRAINT**: phone, email

---

### 8. Orders & Payments History
**Path:** `/orders` หรือคลิก "Orders" ใน Sidebar

**Database Tables Used:**
- `orders` - ออเดอร์ทั้งหมด
- `order_details` - รายละเอียดออเดอร์
- `payments` - การชำระเงิน
- `customers` - ข้อมูลลูกค้า (JOIN)

**How to Use:**
1. ดูออเดอร์ทั้งหมดในตาราง
2. กรองตามสถานะ: All, Pending, Completed, Cancelled
3. กรองตามวันที่: เลือกวันที่ใน Calendar
4. ดูสถิติ: รายได้รวม, จำนวนออเดอร์, Completed, Pending

**Database Operations:**
- **SELECT** from `orders` JOIN `customers` LEFT JOIN `payments`
- **SELECT** from `order_details` WHERE order_id = ?
- **WHERE** clauses: status = ?, order_date = ?
- **GROUP BY** เพื่อคำนวณสถิติ
- **ORDER BY** created_at DESC

---

## 🔄 Database Relationships & Constraints

### Foreign Keys:
- `orders.customer_id` → `customers.customer_id` (SET NULL on delete)
- `order_details.order_id` → `orders.order_id` (CASCADE on delete)
- `order_details.item_id` → `menu_items.item_id` (CASCADE on delete)
- `payments.order_id` → `orders.order_id` (CASCADE on delete)
- `inventory.ingredient_id` → `ingredients.ingredient_id` (CASCADE on delete)
- `inventory.employee_id` → `employees.emp_id` (SET NULL on delete)
- `managers.emp_id` → `employees.emp_id` (CASCADE on delete)
- `baristas.emp_id` → `employees.emp_id` (CASCADE on delete)

### Check Constraints:
- `employees.salary > 0`
- `menu_items.price > 0`
- `orders.total_amount >= 0`
- `order_details.quantity > 0`
- `order_details.unit_price >= 0`
- `payments.amount > 0`
- `inventory.quantity >= 0`

### Indexes:
- Primary keys: ทุกตาราง
- Foreign keys: ทุก FK columns
- Composite indexes: `(order_date, status)`, `(category, is_available)`
- Unique indexes: `email`, `phone` ใน employees และ customers

---

## 💡 Best Practices for Database Score

### 1. Normalization (3NF):
✅ แยก `employees`, `managers`, `baristas` - ลดข้อมูลซ้ำ
✅ Junction Tables (`menu_item_ingredients`, `barista_menu_items`) - จัดการ many-to-many
✅ `order_details` แยกจาก `orders` - ลดข้อมูลซ้ำ

### 2. Constraints:
✅ Primary Keys: ทุกตาราง
✅ Foreign Keys: ทุก relationships
✅ Check Constraints: ตรวจสอบค่าก่อนบันทึก
✅ Unique Constraints: email, phone

### 3. Indexes:
✅ Primary Key Indexes: อัตโนมัติ
✅ Foreign Key Indexes: เร่ง JOIN
✅ Composite Indexes: สำหรับ query ที่ใช้หลาย columns
✅ Index บน columns ที่ใช้ WHERE/SORT บ่อย

### 4. Transactions:
✅ Order Creation: ครอบคลุม `orders`, `order_details`, `payments`
✅ Inventory Update: ตรวจสอบ constraints
✅ Rollback เมื่อเกิด error

### 5. Query Optimization:
✅ ใช้ JOIN แทน multiple queries
✅ ใช้ Indexes สำหรับ WHERE clauses
✅ Pagination สำหรับ list views
✅ Eager loading สำหรับ relationships

---

## 🚀 Quick Start

1. **Start Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📊 Database Features Demonstrated

1. **Normalization**: แยกตารางตาม 3NF
2. **DDL**: CREATE TABLE with constraints
3. **Constraints**: PK, FK, CHECK, UNIQUE
4. **Indexes**: Primary, Foreign, Composite
5. **Transactions**: ACID compliance
6. **Query Optimization**: JOINs, Indexes, Pagination
7. **Physical Storage**: Appropriate data types (Numeric, String, Date)

---

## 🎓 For Database Project Scoring

ระบบนี้แสดงให้เห็น:
- ✅ Database Design (ERD → Schema)
- ✅ Normalization (3NF)
- ✅ SQL DDL (CREATE TABLE)
- ✅ Constraints (PK, FK, CHECK, UNIQUE)
- ✅ Indexes (Primary, Foreign, Composite)
- ✅ Transactions (ACID)
- ✅ Query Processing & Optimization
- ✅ Physical Storage & Index Structures

ทุก feature ใช้ database operations ที่เหมาะสมและแสดงให้เห็นความเข้าใจใน database concepts!

