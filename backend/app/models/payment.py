from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    String,
    ForeignKey,
    DateTime,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import BaseModel


class Payment(BaseModel):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(
        Integer,
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    payment_method = Column(
        String(50), nullable=False
    )  # cash, credit_card, debit_card, mobile_payment
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(
        String(20), default="pending", nullable=False, index=True
    )  # pending, completed, failed
    payment_date = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    # Relationships
    order = relationship("Order", back_populates="payments")

    __table_args__ = (
        CheckConstraint("amount > 0", name="check_payment_amount_positive"),
        CheckConstraint(
            "status IN ('pending', 'completed', 'failed')", name="check_payment_status"
        ),
        Index("idx_payment_order_status", "order_id", "status"),
        Index("idx_payment_date_status", "payment_date", "status"),
    )
