from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from app.core.database import get_db
from app.repositories.menu_item_ingredient_repository import (
    MenuItemIngredientRepository,
)
from app.repositories.menu_item_repository import MenuItemRepository
from app.repositories.ingredient_repository import IngredientRepository
from app.schemas.menu_item_ingredient import (
    MenuItemIngredientCreate,
    MenuItemIngredientUpdate,
    MenuItemIngredientResponse,
)

router = APIRouter(prefix="/recipes", tags=["recipes"], redirect_slashes=False)


@router.get("/menu-item/{item_id}", response_model=List[MenuItemIngredientResponse])
def get_menu_item_recipe(item_id: int, db: Session = Depends(get_db)):
    """Get recipe (ingredients) for a menu item"""
    # Verify menu item exists
    menu_item_repo = MenuItemRepository(db)
    menu_item = menu_item_repo.get(item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    repo = MenuItemIngredientRepository(db)
    return repo.get_by_menu_item(item_id)


@router.get(
    "/ingredient/{ingredient_id}", response_model=List[MenuItemIngredientResponse]
)
def get_ingredient_usage(ingredient_id: int, db: Session = Depends(get_db)):
    """Get all menu items that use this ingredient"""
    # Verify ingredient exists
    ingredient_repo = IngredientRepository(db)
    ingredient = ingredient_repo.get(ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    repo = MenuItemIngredientRepository(db)
    return repo.get_by_ingredient(ingredient_id)


@router.post(
    "/menu-item/{item_id}",
    response_model=MenuItemIngredientResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_ingredient_to_recipe(
    item_id: int,
    recipe_item: MenuItemIngredientCreate,
    db: Session = Depends(get_db),
):
    """Add ingredient to menu item recipe"""
    # Verify menu item exists
    menu_item_repo = MenuItemRepository(db)
    menu_item = menu_item_repo.get(item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Verify ingredient exists
    ingredient_repo = IngredientRepository(db)
    ingredient = ingredient_repo.get(recipe_item.ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    # Normalize and validate unit
    unit = recipe_item.unit.strip() if recipe_item.unit else ingredient.unit
    if not unit:
        unit = ingredient.unit
    
    # Warn if unit doesn't match ingredient unit (but allow it for flexibility)
    if unit.lower() != ingredient.unit.lower():
        # Log warning but allow - some recipes may use different units
        pass

    repo = MenuItemIngredientRepository(db)
    return repo.create(
        item_id=item_id,
        ingredient_id=recipe_item.ingredient_id,
        amount_required=recipe_item.amount_required,
        unit=unit,
    )


@router.put(
    "/menu-item/{item_id}/ingredient/{ingredient_id}",
    response_model=MenuItemIngredientResponse,
)
def update_recipe_ingredient(
    item_id: int,
    ingredient_id: int,
    recipe_item: MenuItemIngredientUpdate,
    db: Session = Depends(get_db),
):
    """Update ingredient amount in recipe"""
    # Get ingredient to validate unit
    ingredient_repo = IngredientRepository(db)
    ingredient = ingredient_repo.get(ingredient_id)
    
    # Normalize unit if provided
    unit = None
    if recipe_item.unit is not None:
        unit = recipe_item.unit.strip()
        if not unit and ingredient:
            unit = ingredient.unit
    
    repo = MenuItemIngredientRepository(db)
    updated = repo.update(
        item_id=item_id,
        ingredient_id=ingredient_id,
        amount_required=recipe_item.amount_required,
        unit=unit,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Recipe item not found")
    return updated


@router.delete(
    "/menu-item/{item_id}/ingredient/{ingredient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_ingredient_from_recipe(
    item_id: int, ingredient_id: int, db: Session = Depends(get_db)
):
    """Remove ingredient from menu item recipe"""
    repo = MenuItemIngredientRepository(db)
    if not repo.delete(item_id, ingredient_id):
        raise HTTPException(status_code=404, detail="Recipe item not found")
