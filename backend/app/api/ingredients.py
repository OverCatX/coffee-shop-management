from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.repositories.ingredient_repository import IngredientRepository
from app.schemas.ingredient import (
    IngredientCreate,
    IngredientUpdate,
    IngredientResponse,
)

router = APIRouter(prefix="/ingredients", tags=["ingredients"], redirect_slashes=False)


@router.post("", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
@router.post(
    "/", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED
)
def create_ingredient(ingredient: IngredientCreate, db: Session = Depends(get_db)):
    """Create a new ingredient"""
    repo = IngredientRepository(db)
    # Check if ingredient with same name already exists
    existing = repo.get_by_name(ingredient.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ingredient with name '{ingredient.name}' already exists",
        )
    return repo.create(ingredient)


@router.get("", response_model=List[IngredientResponse])
@router.get("/", response_model=List[IngredientResponse])
def get_ingredients(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    """Get all ingredients"""
    repo = IngredientRepository(db)
    return repo.get_all(skip=skip, limit=limit)


@router.get("/{ingredient_id}", response_model=IngredientResponse)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """Get ingredient by ID"""
    repo = IngredientRepository(db)
    ingredient = repo.get(ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


@router.put("/{ingredient_id}", response_model=IngredientResponse)
def update_ingredient(
    ingredient_id: int, ingredient: IngredientUpdate, db: Session = Depends(get_db)
):
    """Update an ingredient"""
    repo = IngredientRepository(db)
    updated = repo.update(ingredient_id, ingredient)
    if not updated:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return updated


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """Delete an ingredient"""
    repo = IngredientRepository(db)
    if not repo.delete(ingredient_id):
        raise HTTPException(status_code=404, detail="Ingredient not found")
