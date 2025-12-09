from sqlalchemy import Column, Integer, String, Numeric, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Customer(BaseModel):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    email = Column(String(100), unique=True, nullable=True, index=True)
    loyalty_points = Column(Numeric(10, 2), default=0, nullable=False)

    # Relationships
    orders = relationship("Order", back_populates="customer")

    __table_args__ = (Index("idx_customer_phone_email", "phone", "email"),)
