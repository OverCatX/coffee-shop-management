from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import date
from typing import Optional, List


class OrderDetailBase(BaseModel):
    item_id: int
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0, decimal_places=2)
    subtotal: Decimal = Field(..., ge=0, decimal_places=2)


class OrderDetailCreate(OrderDetailBase):
    pass


class OrderDetailResponse(OrderDetailBase):
    order_id: int
    created_at: str
    updated_at: str
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    customer_id: Optional[int] = None
    order_date: date
    total_amount: Decimal = Field(..., ge=0, decimal_places=2)
    status: str = Field(default="pending", pattern="^(pending|completed|cancelled)$")


class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    order_date: date
    order_details: List[OrderDetailCreate]
    payment_method: str = Field(..., min_length=1, max_length=50)
    payment_amount: Decimal = Field(..., gt=0, decimal_places=2)


class OrderUpdate(BaseModel):
    customer_id: Optional[int] = None
    order_date: Optional[date] = None
    total_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    status: Optional[str] = Field(None, pattern="^(pending|completed|cancelled)$")


class OrderResponse(OrderBase):
    order_id: int
    created_at: str
    updated_at: str
    is_deleted: bool
    order_details: List[OrderDetailResponse] = []

    model_config = ConfigDict(from_attributes=True)

