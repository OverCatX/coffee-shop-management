from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict
from decimal import Decimal
from app.core.database import get_db
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.menu_item_ingredient_repository import (
    MenuItemIngredientRepository,
)
from app.repositories.menu_item_repository import MenuItemRepository
from app.schemas.inventory import InventoryResponse

router = APIRouter(prefix="/stock", tags=["stock"], redirect_slashes=False)


@router.post("/ingredient/{ingredient_id}/restock", response_model=InventoryResponse)
def restock_ingredient(
    ingredient_id: int,
    quantity: Decimal = Query(..., description="Quantity to add", gt=0),
    employee_id: int = Query(None, description="Employee ID who restocked"),
    db: Session = Depends(get_db),
):
    """Restock an ingredient (add quantity)"""
    repo = InventoryRepository(db)
    inventory = repo.update_quantity(ingredient_id, quantity, employee_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return inventory


@router.get("/menu-item/{item_id}/availability", response_model=Dict)
def check_menu_item_availability(item_id: int, db: Session = Depends(get_db)):
    """Check if a menu item can be made based on ingredient stock"""
    menu_item_repo = MenuItemRepository(db)
    menu_item = menu_item_repo.get(item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    recipe_repo = MenuItemIngredientRepository(db)
    recipe_items = recipe_repo.get_by_menu_item(item_id)

    inventory_repo = InventoryRepository(db)

    availability = {
        "item_id": item_id,
        "item_name": menu_item.name,
        "can_make": True,
        "missing_ingredients": [],
        "low_stock_ingredients": [],
        "ingredients_status": [],
    }

    for recipe_item in recipe_items:
        inventory = inventory_repo.get_by_ingredient(recipe_item.ingredient_id)

        if not inventory:
            availability["can_make"] = False
            availability["missing_ingredients"].append(
                {
                    "ingredient_id": recipe_item.ingredient_id,
                    "ingredient_name": recipe_item.ingredient.name,
                    "required": float(recipe_item.amount_required),
                    "unit": recipe_item.unit,
                    "available": 0,
                }
            )
            availability["ingredients_status"].append(
                {
                    "ingredient_id": recipe_item.ingredient_id,
                    "ingredient_name": recipe_item.ingredient.name,
                    "required": float(recipe_item.amount_required),
                    "available": 0,
                    "unit": recipe_item.unit,
                    "status": "missing",
                }
            )
        else:
            available_qty = float(inventory.quantity)
            required_qty = float(recipe_item.amount_required)

            if available_qty < required_qty:
                availability["can_make"] = False
                availability["missing_ingredients"].append(
                    {
                        "ingredient_id": recipe_item.ingredient_id,
                        "ingredient_name": recipe_item.ingredient.name,
                        "required": required_qty,
                        "unit": recipe_item.unit,
                        "available": available_qty,
                    }
                )
                availability["ingredients_status"].append(
                    {
                        "ingredient_id": recipe_item.ingredient_id,
                        "ingredient_name": recipe_item.ingredient.name,
                        "required": required_qty,
                        "available": available_qty,
                        "unit": recipe_item.unit,
                        "status": "insufficient",
                    }
                )
            elif available_qty <= float(inventory.min_threshold):
                availability["low_stock_ingredients"].append(
                    {
                        "ingredient_id": recipe_item.ingredient_id,
                        "ingredient_name": recipe_item.ingredient.name,
                        "required": required_qty,
                        "unit": recipe_item.unit,
                        "available": available_qty,
                        "min_threshold": float(inventory.min_threshold),
                    }
                )
                availability["ingredients_status"].append(
                    {
                        "ingredient_id": recipe_item.ingredient_id,
                        "ingredient_name": recipe_item.ingredient.name,
                        "required": required_qty,
                        "available": available_qty,
                        "unit": recipe_item.unit,
                        "status": "low_stock",
                    }
                )
            else:
                availability["ingredients_status"].append(
                    {
                        "ingredient_id": recipe_item.ingredient_id,
                        "ingredient_name": recipe_item.ingredient.name,
                        "required": required_qty,
                        "available": available_qty,
                        "unit": recipe_item.unit,
                        "status": "available",
                    }
                )

    return availability


@router.get("/order/{order_id}/availability", response_model=Dict)
def check_order_availability(order_id: int, db: Session = Depends(get_db)):
    """Check availability for all items in an order with optimized queries"""
    from app.repositories.order_repository import OrderRepository

    order_repo = OrderRepository(db)
    # get() already eager loads order_details and menu_item
    order = order_repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    recipe_repo = MenuItemIngredientRepository(db)
    inventory_repo = InventoryRepository(db)

    # Batch fetch all recipes for all items in the order
    item_ids = [detail.item_id for detail in order.order_details]
    all_recipes = recipe_repo.get_by_menu_items(item_ids) if item_ids else []

    # Create a map of item_id -> recipes for quick lookup
    recipes_by_item = {}
    for recipe in all_recipes:
        if recipe.item_id not in recipes_by_item:
            recipes_by_item[recipe.item_id] = []
        recipes_by_item[recipe.item_id].append(recipe)

    order_availability = {
        "order_id": order_id,
        "can_fulfill": True,
        "items": [],
    }

    for order_detail in order.order_details:
        # menu_item is already loaded via eager loading
        menu_item = order_detail.menu_item
        if not menu_item:
            continue

        recipe_items = recipes_by_item.get(order_detail.item_id, [])
        item_availability = {
            "item_id": order_detail.item_id,
            "item_name": menu_item.name,
            "quantity": order_detail.quantity,
            "can_make": True,
            "missing_ingredients": [],
        }

        # Check if we have enough stock for the quantity ordered
        for recipe_item in recipe_items:
            inventory = inventory_repo.get_by_ingredient(recipe_item.ingredient_id)
            if not inventory:
                item_availability["can_make"] = False
                item_availability["missing_ingredients"].append(
                    {
                        "ingredient_name": recipe_item.ingredient.name,
                        "required": float(recipe_item.amount_required)
                        * order_detail.quantity,
                        "available": 0,
                        "unit": recipe_item.unit,
                    }
                )
            else:
                total_required = (
                    float(recipe_item.amount_required) * order_detail.quantity
                )
                available_qty = float(inventory.quantity)

                if available_qty < total_required:
                    item_availability["can_make"] = False
                    item_availability["missing_ingredients"].append(
                        {
                            "ingredient_name": recipe_item.ingredient.name,
                            "required": total_required,
                            "available": available_qty,
                            "unit": recipe_item.unit,
                        }
                    )

        if not item_availability["can_make"]:
            order_availability["can_fulfill"] = False

        order_availability["items"].append(item_availability)

    return order_availability
