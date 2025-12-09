from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    Date,
    String,
    ForeignKey,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Order(BaseModel):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(
        Integer,
        ForeignKey("customers.customer_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    order_date = Column(Date, nullable=False, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(
        String(20), default="pending", nullable=False, index=True
    )  # pending, completed, cancelled

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    order_details = relationship(
        "OrderDetail", back_populates="order", cascade="all, delete-orphan"
    )
    payments = relationship(
        "Payment", back_populates="order", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="check_total_amount_non_negative"),
        CheckConstraint(
            "status IN ('pending', 'completed', 'cancelled')", name="check_order_status"
        ),
        Index("idx_order_date_status", "order_date", "status"),
        Index("idx_order_customer_date", "customer_id", "order_date"),
    )


class OrderDetail(BaseModel):
    __tablename__ = "order_details"

    order_id = Column(
        Integer,
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )
    item_id = Column(
        Integer,
        ForeignKey("menu_items.item_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="order_details")
    menu_item = relationship("MenuItem", back_populates="order_details")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="check_unit_price_non_negative"),
        CheckConstraint("subtotal >= 0", name="check_subtotal_non_negative"),
    )
