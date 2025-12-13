from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.menu_item import MenuItem
from app.models.junction_tables import MenuItemIngredient
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate
from app.core.logging import logger


class MenuItemRepository:
    """Repository for MenuItem operations with query optimization"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, item_id: int) -> Optional[MenuItem]:
        """Get menu item by ID with relationships"""
        return self.db.query(MenuItem).filter(
            and_(MenuItem.item_id == item_id, MenuItem.is_deleted == False)
        ).options(
            joinedload(MenuItem.ingredients).joinedload(MenuItemIngredient.ingredient)
        ).first()

    def get_all(self, skip: int = 0, limit: int = 100, available_only: bool = False) -> List[MenuItem]:
        """Get all menu items with pagination"""
        query = self.db.query(MenuItem).filter(MenuItem.is_deleted == False)
        
        if available_only:
            query = query.filter(MenuItem.is_available == True)
        
        return query.offset(skip).limit(limit).all()

    def get_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[MenuItem]:
        """Get menu items by category with optimized query"""
        return self.db.query(MenuItem).filter(
            and_(
                MenuItem.category == category,
                MenuItem.is_available == True,
                MenuItem.is_deleted == False
            )
        ).offset(skip).limit(limit).all()

    def get_available(self, skip: int = 0, limit: int = 100) -> List[MenuItem]:
        """Get only available menu items"""
        return self.get_all(skip=skip, limit=limit, available_only=True)

    def create(self, menu_item_data: MenuItemCreate) -> MenuItem:
        """Create a new menu item"""
        menu_item_dict = menu_item_data.model_dump()
        menu_item = MenuItem(**menu_item_dict)
        self.db.add(menu_item)
        self.db.commit()
        self.db.refresh(menu_item)
        logger.info(f"Created menu item: {menu_item.item_id}")
        return menu_item

    def update(self, item_id: int, menu_item_data: MenuItemUpdate) -> Optional[MenuItem]:
        """Update an existing menu item"""
        menu_item = self.get(item_id)
        if not menu_item:
            return None
        
        update_data = menu_item_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(menu_item, field, value)
        
        self.db.commit()
        self.db.refresh(menu_item)
        logger.info(f"Updated menu item: {item_id}")
        return menu_item

    def delete(self, item_id: int) -> bool:
        """Soft delete a menu item"""
        menu_item = self.get(item_id)
        if not menu_item:
            return False
        
        menu_item.is_deleted = True
        self.db.commit()
        logger.info(f"Deleted menu item: {item_id}")
        return True

    def toggle_availability(self, item_id: int) -> Optional[MenuItem]:
        """Toggle menu item availability"""
        menu_item = self.get(item_id)
        if not menu_item:
            return None
        
        menu_item.is_available = not menu_item.is_available
        self.db.commit()
        self.db.refresh(menu_item)
        logger.info(f"Toggled availability for menu item: {item_id}")
        return menu_item

