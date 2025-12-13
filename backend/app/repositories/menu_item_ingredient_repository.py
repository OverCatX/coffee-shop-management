from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from decimal import Decimal
from app.models.junction_tables import MenuItemIngredient
from app.models.menu_item import MenuItem
from app.models.ingredient import Ingredient
from app.core.logging import logger


class MenuItemIngredientRepository:
    """Repository for MenuItemIngredient (Recipe) operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_by_menu_item(self, item_id: int) -> List[MenuItemIngredient]:
        """Get all ingredients for a menu item (recipe)"""
        return (
            self.db.query(MenuItemIngredient)
            .filter(
                and_(
                    MenuItemIngredient.item_id == item_id,
                    MenuItemIngredient.is_deleted == False,
                )
            )
            .options(joinedload(MenuItemIngredient.ingredient))
            .all()
        )

    def get_by_menu_items(self, item_ids: List[int]) -> List[MenuItemIngredient]:
        """Batch get recipes for multiple menu items to prevent N+1 queries"""
        if not item_ids:
            return []
        return (
            self.db.query(MenuItemIngredient)
            .filter(
                and_(
                    MenuItemIngredient.item_id.in_(item_ids),
                    MenuItemIngredient.is_deleted == False,
                )
            )
            .options(joinedload(MenuItemIngredient.ingredient))
            .all()
        )

    def get_by_ingredient(self, ingredient_id: int) -> List[MenuItemIngredient]:
        """Get all menu items that use this ingredient"""
        return (
            self.db.query(MenuItemIngredient)
            .filter(
                and_(
                    MenuItemIngredient.ingredient_id == ingredient_id,
                    MenuItemIngredient.is_deleted == False,
                )
            )
            .options(joinedload(MenuItemIngredient.menu_item))
            .all()
        )

    def get(self, item_id: int, ingredient_id: int) -> Optional[MenuItemIngredient]:
        """Get specific menu item ingredient relationship"""
        return (
            self.db.query(MenuItemIngredient)
            .filter(
                and_(
                    MenuItemIngredient.item_id == item_id,
                    MenuItemIngredient.ingredient_id == ingredient_id,
                    MenuItemIngredient.is_deleted == False,
                )
            )
            .options(
                joinedload(MenuItemIngredient.ingredient),
                joinedload(MenuItemIngredient.menu_item),
            )
            .first()
        )

    def create(
        self, item_id: int, ingredient_id: int, amount_required: Decimal, unit: str
    ) -> MenuItemIngredient:
        """Add ingredient to menu item recipe"""
        # Check if relationship already exists
        existing = self.get(item_id, ingredient_id)
        if existing:
            # Update existing
            existing.amount_required = amount_required
            existing.unit = unit
            self.db.commit()
            self.db.refresh(existing)
            logger.info(f"Updated recipe: item {item_id}, ingredient {ingredient_id}")
            # Reload with relationships
            return self.get(item_id, ingredient_id) or existing

        menu_item_ingredient = MenuItemIngredient(
            item_id=item_id,
            ingredient_id=ingredient_id,
            amount_required=amount_required,
            unit=unit,
        )
        self.db.add(menu_item_ingredient)
        self.db.commit()
        self.db.refresh(menu_item_ingredient)
        logger.info(f"Created recipe: item {item_id}, ingredient {ingredient_id}")
        # Reload with relationships
        return self.get(item_id, ingredient_id) or menu_item_ingredient

    def update(
        self,
        item_id: int,
        ingredient_id: int,
        amount_required: Optional[Decimal] = None,
        unit: Optional[str] = None,
    ) -> Optional[MenuItemIngredient]:
        """Update recipe ingredient amount"""
        menu_item_ingredient = self.get(item_id, ingredient_id)
        if not menu_item_ingredient:
            return None

        if amount_required is not None:
            menu_item_ingredient.amount_required = amount_required
        if unit is not None:
            menu_item_ingredient.unit = unit

        self.db.commit()
        self.db.refresh(menu_item_ingredient)
        logger.info(f"Updated recipe: item {item_id}, ingredient {ingredient_id}")
        # Reload with relationships
        return self.get(item_id, ingredient_id) or menu_item_ingredient

    def delete(self, item_id: int, ingredient_id: int) -> bool:
        """Remove ingredient from menu item recipe"""
        menu_item_ingredient = self.get(item_id, ingredient_id)
        if not menu_item_ingredient:
            return False

        menu_item_ingredient.is_deleted = True
        self.db.commit()
        logger.info(f"Deleted recipe: item {item_id}, ingredient {ingredient_id}")
        return True

    def delete_all_for_menu_item(self, item_id: int) -> int:
        """Delete all ingredients for a menu item"""
        count = (
            self.db.query(MenuItemIngredient)
            .filter(
                and_(
                    MenuItemIngredient.item_id == item_id,
                    MenuItemIngredient.is_deleted == False,
                )
            )
            .update({"is_deleted": True})
        )
        self.db.commit()
        logger.info(f"Deleted {count} recipe items for menu item {item_id}")
        return count
