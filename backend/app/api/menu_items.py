from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.repositories.menu_item_repository import MenuItemRepository
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate, MenuItemResponse

router = APIRouter(prefix="/menu-items", tags=["menu-items"])


@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(menu_item: MenuItemCreate, db: Session = Depends(get_db)):
    """Create a new menu item"""
    repo = MenuItemRepository(db)
    return repo.create(menu_item)


@router.get("", response_model=List[MenuItemResponse])
@router.get("/", response_model=List[MenuItemResponse])
def get_menu_items(
    skip: int = 0,
    limit: int = 100,
    available_only: bool = Query(False, description="Show only available items"),
    db: Session = Depends(get_db),
):
    """Get all menu items"""
    repo = MenuItemRepository(db)
    if available_only:
        return repo.get_available(skip=skip, limit=limit)
    return repo.get_all(skip=skip, limit=limit)


@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Get menu item by ID"""
    repo = MenuItemRepository(db)
    menu_item = repo.get(item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return menu_item


@router.get("/category/{category}", response_model=List[MenuItemResponse])
def get_menu_items_by_category(
    category: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Get menu items by category"""
    repo = MenuItemRepository(db)
    return repo.get_by_category(category, skip=skip, limit=limit)


@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: int, menu_item: MenuItemUpdate, db: Session = Depends(get_db)
):
    """Update a menu item"""
    repo = MenuItemRepository(db)
    updated = repo.update(item_id, menu_item)
    if not updated:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return updated


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a menu item"""
    repo = MenuItemRepository(db)
    if not repo.delete(item_id):
        raise HTTPException(status_code=404, detail="Menu item not found")


@router.post("/{item_id}/toggle-availability", response_model=MenuItemResponse)
def toggle_menu_item_availability(item_id: int, db: Session = Depends(get_db)):
    """Toggle menu item availability"""
    repo = MenuItemRepository(db)
    menu_item = repo.toggle_availability(item_id)
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return menu_item
