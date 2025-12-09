from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """Create a new payment"""
    payment_dict = payment.model_dump()
    db_payment = Payment(**payment_dict)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.get("/", response_model=List[PaymentResponse])
def get_payments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all payments"""
    return db.query(Payment).filter(
        Payment.is_deleted == False
    ).offset(skip).limit(limit).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """Get payment by ID"""
    payment = db.query(Payment).filter(
        Payment.payment_id == payment_id,
        Payment.is_deleted == False
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.get("/order/{order_id}", response_model=List[PaymentResponse])
def get_payments_by_order(order_id: int, db: Session = Depends(get_db)):
    """Get payments by order ID"""
    return db.query(Payment).filter(
        Payment.order_id == order_id,
        Payment.is_deleted == False
    ).all()


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(payment_id: int, payment: PaymentUpdate, db: Session = Depends(get_db)):
    """Update a payment"""
    db_payment = db.query(Payment).filter(
        Payment.payment_id == payment_id,
        Payment.is_deleted == False
    ).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    update_data = payment.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_payment, field, value)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.patch("/{payment_id}/status", response_model=PaymentResponse)
def update_payment_status(
    payment_id: int,
    status: str = Query(..., description="New status: pending, completed, or failed"),
    db: Session = Depends(get_db)
):
    """Update payment status"""
    if status not in ['pending', 'completed', 'failed']:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    payment = db.query(Payment).filter(
        Payment.payment_id == payment_id,
        Payment.is_deleted == False
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = status
    db.commit()
    db.refresh(payment)
    return payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    """Delete a payment"""
    payment = db.query(Payment).filter(
        Payment.payment_id == payment_id,
        Payment.is_deleted == False
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.is_deleted = True
    db.commit()

