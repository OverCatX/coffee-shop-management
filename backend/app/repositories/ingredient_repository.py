from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.ingredient import Ingredient
from app.models.junction_tables import MenuItemIngredient
from app.schemas.ingredient import IngredientCreate, IngredientUpdate
from app.core.logging import logger


class IngredientRepository:
    """Repository for Ingredient operations with query optimization"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, ingredient_id: int) -> Optional[Ingredient]:
        """Get ingredient by ID with relationships"""
        return (
            self.db.query(Ingredient)
            .filter(
                and_(
                    Ingredient.ingredient_id == ingredient_id,
                    Ingredient.is_deleted == False,
                )
            )
            .options(
                joinedload(Ingredient.menu_item_ingredients).joinedload(
                    MenuItemIngredient.menu_item
                )
            )
            .first()
        )

    def get_all(self, skip: int = 0, limit: int = 1000) -> List[Ingredient]:
        """Get all ingredients with pagination"""
        return (
            self.db.query(Ingredient)
            .filter(Ingredient.is_deleted == False)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_name(self, name: str) -> Optional[Ingredient]:
        """Get ingredient by name"""
        return (
            self.db.query(Ingredient)
            .filter(and_(Ingredient.name == name, Ingredient.is_deleted == False))
            .first()
        )

    def create(self, ingredient_data: IngredientCreate) -> Ingredient:
        """Create a new ingredient"""
        ingredient_dict = ingredient_data.model_dump()
        ingredient = Ingredient(**ingredient_dict)
        self.db.add(ingredient)
        self.db.commit()
        self.db.refresh(ingredient)
        logger.info(f"Created ingredient: {ingredient.ingredient_id}")
        return ingredient

    def update(
        self, ingredient_id: int, ingredient_data: IngredientUpdate
    ) -> Optional[Ingredient]:
        """Update an existing ingredient"""
        ingredient = self.get(ingredient_id)
        if not ingredient:
            return None

        update_data = ingredient_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(ingredient, field, value)

        self.db.commit()
        self.db.refresh(ingredient)
        logger.info(f"Updated ingredient: {ingredient_id}")
        return ingredient

    def delete(self, ingredient_id: int) -> bool:
        """Soft delete an ingredient"""
        ingredient = self.get(ingredient_id)
        if not ingredient:
            return False

        ingredient.is_deleted = True
        self.db.commit()
        logger.info(f"Deleted ingredient: {ingredient_id}")
        return True
