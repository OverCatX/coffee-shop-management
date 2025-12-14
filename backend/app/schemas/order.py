from pydantic import BaseModel, Field, ConfigDict, field_serializer, model_validator
from decimal import Decimal
from datetime import date, datetime
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
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: datetime | None, _info) -> str | None:
        """Serialize datetime to ISO format string"""
        if dt is None:
            return None
        return dt.isoformat()


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
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    order_details: List[OrderDetailResponse] = []
    payment_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def populate_payment_amount(cls, data):
        """Populate payment_amount from payments relationship"""
        # If data is an ORM object, extract payment_amount from payments
        if hasattr(data, 'payments'):
            payments = data.payments
            if payments:
                # Get the first payment's amount (should only be one payment per order)
                if isinstance(payments, list) and len(payments) > 0:
                    payment = payments[0]
                    if hasattr(payment, 'amount'):
                        # Set payment_amount as an attribute
                        setattr(data, 'payment_amount', payment.amount)
        return data

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: datetime | None, _info) -> str | None:
        """Serialize datetime to ISO format string"""
        if dt is None:
            return None
        return dt.isoformat()

