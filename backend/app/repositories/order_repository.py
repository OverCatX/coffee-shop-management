from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_
from datetime import date
from decimal import Decimal
from app.models.order import Order, OrderDetail
from app.models.menu_item import MenuItem
from app.models.payment import Payment
from app.schemas.order import OrderCreate, OrderUpdate, OrderDetailCreate
from app.repositories.menu_item_ingredient_repository import MenuItemIngredientRepository
from app.repositories.inventory_repository import InventoryRepository
from app.core.logging import logger


class OrderRepository:
    """Repository for Order operations with transaction handling and query optimization"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, order_id: int) -> Optional[Order]:
        """Get order by ID with relationships"""
        return self.db.query(Order).filter(
            and_(Order.order_id == order_id, Order.is_deleted == False)
        ).options(
            joinedload(Order.customer),
            selectinload(Order.order_details).joinedload(OrderDetail.menu_item),
            selectinload(Order.payments)
        ).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get all orders with pagination"""
        return self.db.query(Order).filter(
            Order.is_deleted == False
        ).options(
            joinedload(Order.customer),
            selectinload(Order.payments)
        ).order_by(Order.order_date.desc()).offset(skip).limit(limit).all()

    def get_by_customer(self, customer_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get orders by customer ID"""
        return self.db.query(Order).filter(
            and_(
                Order.customer_id == customer_id,
                Order.is_deleted == False
            )
        ).options(
            selectinload(Order.order_details).joinedload(OrderDetail.menu_item),
            selectinload(Order.payments)
        ).order_by(Order.order_date.desc()).offset(skip).limit(limit).all()

    def get_by_status(self, status: str, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get orders by status with eager loading to prevent N+1 queries"""
        return self.db.query(Order).filter(
            and_(
                Order.status == status,
                Order.is_deleted == False
            )
        ).options(
            joinedload(Order.customer),
            selectinload(Order.order_details).joinedload(OrderDetail.menu_item),
            selectinload(Order.payments)
        ).order_by(Order.order_date.desc()).offset(skip).limit(limit).all()

    def get_by_date_range(self, start_date: date, end_date: date, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get orders within date range"""
        return self.db.query(Order).filter(
            and_(
                Order.order_date >= start_date,
                Order.order_date <= end_date,
                Order.is_deleted == False
            )
        ).options(
            joinedload(Order.customer),
            selectinload(Order.payments)
        ).order_by(Order.order_date.desc()).offset(skip).limit(limit).all()

    def create(self, order_data: OrderCreate) -> Optional[Order]:
        """Create a new order with order details and payment in a transaction"""
        try:
            # Calculate total amount from order details
            total_amount = Decimal('0')
            order_details_data = []
            
            for detail in order_data.order_details:
                # Get menu item to verify availability and get current price
                menu_item = self.db.query(MenuItem).filter(
                    and_(
                        MenuItem.item_id == detail.item_id,
                        MenuItem.is_available == True,
                        MenuItem.is_deleted == False
                    )
                ).first()
                
                if not menu_item:
                    raise ValueError(f"Menu item {detail.item_id} not found or not available")
                
                # Use current menu item price
                unit_price = menu_item.price
                subtotal = unit_price * detail.quantity
                total_amount += subtotal
                
                order_details_data.append({
                    'item_id': detail.item_id,
                    'quantity': detail.quantity,
                    'unit_price': unit_price,
                    'subtotal': subtotal
                })
            
            # Create order
            order = Order(
                customer_id=order_data.customer_id,
                order_date=order_data.order_date,
                total_amount=total_amount,
                status='pending'
            )
            self.db.add(order)
            self.db.flush()  # Get order_id
            
            # Create order details
            for detail_data in order_details_data:
                order_detail = OrderDetail(
                    order_id=order.order_id,
                    **detail_data
                )
                self.db.add(order_detail)
            
            # Create payment
            payment = Payment(
                order_id=order.order_id,
                payment_method=order_data.payment_method,
                amount=order_data.payment_amount,
                status='pending'
            )
            self.db.add(payment)
            
            # Commit transaction
            self.db.commit()
            self.db.refresh(order)
            
            logger.info(f"Created order: {order.order_id} with total: {total_amount}")
            return order
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating order: {str(e)}")
            raise

    def update(self, order_id: int, order_data: OrderUpdate) -> Optional[Order]:
        """Update an existing order"""
        order = self.get(order_id)
        if not order:
            return None
        
        update_data = order_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(order, field, value)
        
        self.db.commit()
        self.db.refresh(order)
        logger.info(f"Updated order: {order_id}")
        return order

    def update_status(self, order_id: int, status: str) -> Optional[Order]:
        """Update order status and deduct stock when completing order"""
        order = self.get(order_id)
        if not order:
            return None
        
        # If completing order, deduct stock from inventory
        if status == 'completed' and order.status != 'completed':
            try:
                # Get order details with menu items
                order_details = order.order_details
                if not order_details:
                    logger.warning(f"Order {order_id} has no order details")
                else:
                    # Initialize repositories
                    recipe_repo = MenuItemIngredientRepository(self.db)
                    inventory_repo = InventoryRepository(self.db)
                    
                    # Deduct stock for each order detail
                    for detail in order_details:
                        item_id = detail.item_id
                        quantity = detail.quantity
                        
                        # Get recipe for this menu item
                        recipe_items = recipe_repo.get_by_menu_item(item_id)
                        
                        if not recipe_items:
                            logger.warning(f"Menu item {item_id} has no recipe defined")
                            continue
                        
                        # Deduct stock for each ingredient in the recipe
                        for recipe_item in recipe_items:
                            ingredient_id = recipe_item.ingredient_id
                            amount_required = recipe_item.amount_required
                            
                            # Calculate total amount needed (amount per item * quantity)
                            total_amount_needed = amount_required * Decimal(str(quantity))
                            
                            # Check if inventory exists and has enough stock
                            inventory = inventory_repo.get_by_ingredient(ingredient_id)
                            if not inventory:
                                raise ValueError(
                                    f"Insufficient stock: Ingredient {ingredient_id} not found in inventory"
                                )
                            
                            if inventory.quantity < total_amount_needed:
                                raise ValueError(
                                    f"Insufficient stock: Ingredient {ingredient_id} "
                                    f"has {inventory.quantity} but needs {total_amount_needed}"
                                )
                            
                            # Deduct from inventory (negative value to subtract)
                            inventory_repo.update_quantity(
                                ingredient_id=ingredient_id,
                                quantity_change=-total_amount_needed,  # Negative to deduct
                                employee_id=None  # System deduction
                            )
                            
                            logger.info(
                                f"Deducted {total_amount_needed} of ingredient {ingredient_id} "
                                f"for {quantity}x menu item {item_id} (order {order_id})"
                            )
                    
                    logger.info(f"Stock deducted for order {order_id}")
                    
            except Exception as e:
                logger.error(f"Error deducting stock for order {order_id}: {str(e)}")
                # Rollback transaction if stock deduction fails
                self.db.rollback()
                raise ValueError(f"Failed to deduct stock: {str(e)}")
        
        # Update order status
        order.status = status
        self.db.commit()
        self.db.refresh(order)
        logger.info(f"Updated order status: {order_id} to {status}")
        return order

    def delete(self, order_id: int) -> bool:
        """Soft delete an order"""
        order = self.get(order_id)
        if not order:
            return False
        
        order.is_deleted = True
        self.db.commit()
        logger.info(f"Deleted order: {order_id}")
        return True

