from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from app.core.database import get_db
from app.repositories.inventory_repository import InventoryRepository
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse

router = APIRouter(prefix="/inventory", tags=["inventory"], redirect_slashes=False)


@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory(inventory: InventoryCreate, db: Session = Depends(get_db)):
    """Create a new inventory record"""
    repo = InventoryRepository(db)
    return repo.create(inventory)


@router.get("", response_model=List[InventoryResponse])
@router.get("/", response_model=List[InventoryResponse])
def get_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all inventory records"""
    repo = InventoryRepository(db)
    return repo.get_all(skip=skip, limit=limit)


@router.get("/low-stock", response_model=List[InventoryResponse])
def get_low_stock(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get inventory items with quantity below threshold"""
    repo = InventoryRepository(db)
    return repo.get_low_stock(skip=skip, limit=limit)


@router.get("/{inventory_id}", response_model=InventoryResponse)
def get_inventory_record(inventory_id: int, db: Session = Depends(get_db)):
    """Get inventory record by ID"""
    repo = InventoryRepository(db)
    inventory = repo.get(inventory_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return inventory


@router.get("/ingredient/{ingredient_id}", response_model=InventoryResponse)
def get_inventory_by_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """Get inventory record by ingredient ID"""
    repo = InventoryRepository(db)
    inventory = repo.get_by_ingredient(ingredient_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return inventory


@router.put("/{inventory_id}", response_model=InventoryResponse)
def update_inventory(
    inventory_id: int, inventory: InventoryUpdate, db: Session = Depends(get_db)
):
    """Update an inventory record"""
    repo = InventoryRepository(db)
    updated = repo.update(inventory_id, inventory)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return updated


@router.patch("/ingredient/{ingredient_id}/quantity", response_model=InventoryResponse)
def update_quantity(
    ingredient_id: int,
    quantity_change: Decimal = Query(
        ..., description="Quantity change (can be negative)"
    ),
    employee_id: int = Query(None, description="Employee ID who made the change"),
    db: Session = Depends(get_db),
):
    """Update inventory quantity"""
    repo = InventoryRepository(db)
    inventory = repo.update_quantity(ingredient_id, quantity_change, employee_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return inventory


@router.delete("/{inventory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory(inventory_id: int, db: Session = Depends(get_db)):
    """Delete an inventory record"""
    repo = InventoryRepository(db)
    if not repo.delete(inventory_id):
        raise HTTPException(status_code=404, detail="Inventory record not found")
