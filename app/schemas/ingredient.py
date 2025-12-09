from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class IngredientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    unit: str = Field(..., min_length=1, max_length=20)


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    unit: Optional[str] = Field(None, min_length=1, max_length=20)


class IngredientResponse(IngredientBase):
    ingredient_id: int
    created_at: str
    updated_at: str
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)

