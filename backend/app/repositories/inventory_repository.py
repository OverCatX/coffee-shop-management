from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from decimal import Decimal
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate, InventoryUpdate
from app.core.logging import logger


class InventoryRepository:
    """Repository for Inventory operations with query optimization"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, inventory_id: int) -> Optional[Inventory]:
        """Get inventory record by ID with relationships"""
        return self.db.query(Inventory).filter(
            and_(Inventory.inventory_id == inventory_id, Inventory.is_deleted == False)
        ).options(
            joinedload(Inventory.ingredient),
            joinedload(Inventory.employee)
        ).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Inventory]:
        """Get all inventory records with pagination"""
        return self.db.query(Inventory).filter(
            Inventory.is_deleted == False
        ).options(
            joinedload(Inventory.ingredient)
        ).offset(skip).limit(limit).all()

    def get_by_ingredient(self, ingredient_id: int) -> Optional[Inventory]:
        """Get inventory record by ingredient ID"""
        return self.db.query(Inventory).filter(
            and_(
                Inventory.ingredient_id == ingredient_id,
                Inventory.is_deleted == False
            )
        ).options(
            joinedload(Inventory.ingredient)
        ).first()

    def get_low_stock(self, skip: int = 0, limit: int = 100) -> List[Inventory]:
        """Get inventory items with quantity below threshold"""
        return self.db.query(Inventory).filter(
            and_(
                Inventory.quantity <= Inventory.min_threshold,
                Inventory.is_deleted == False
            )
        ).options(
            joinedload(Inventory.ingredient)
        ).offset(skip).limit(limit).all()

    def create(self, inventory_data: InventoryCreate) -> Inventory:
        """Create a new inventory record"""
        inventory_dict = inventory_data.model_dump()
        inventory = Inventory(**inventory_dict)
        self.db.add(inventory)
        self.db.commit()
        self.db.refresh(inventory)
        logger.info(f"Created inventory record: {inventory.inventory_id}")
        return inventory

    def update(self, inventory_id: int, inventory_data: InventoryUpdate) -> Optional[Inventory]:
        """Update an existing inventory record"""
        inventory = self.get(inventory_id)
        if not inventory:
            return None
        
        update_data = inventory_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(inventory, field, value)
        
        self.db.commit()
        self.db.refresh(inventory)
        logger.info(f"Updated inventory record: {inventory_id}")
        return inventory

    def update_quantity(self, ingredient_id: int, quantity_change: Decimal, employee_id: Optional[int] = None) -> Optional[Inventory]:
        """Update inventory quantity (add or subtract)"""
        inventory = self.get_by_ingredient(ingredient_id)
        if not inventory:
            return None
        
        inventory.quantity += quantity_change
        if inventory.quantity < 0:
            inventory.quantity = Decimal('0')
        
        if employee_id:
            inventory.employee_id = employee_id
        
        self.db.commit()
        self.db.refresh(inventory)
        logger.info(f"Updated quantity for ingredient {ingredient_id}: {quantity_change}")
        return inventory

    def delete(self, inventory_id: int) -> bool:
        """Soft delete an inventory record"""
        inventory = self.get(inventory_id)
        if not inventory:
            return False
        
        inventory.is_deleted = True
        self.db.commit()
        logger.info(f"Deleted inventory record: {inventory_id}")
        return True

