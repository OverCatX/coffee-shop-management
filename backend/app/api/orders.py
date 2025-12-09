from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.repositories.order_repository import OrderRepository
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order with order details and payment"""
    repo = OrderRepository(db)
    try:
        return repo.create(order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")


@router.get("/", response_model=List[OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all orders"""
    repo = OrderRepository(db)
    return repo.get_all(skip=skip, limit=limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order by ID"""
    repo = OrderRepository(db)
    order = repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/customer/{customer_id}", response_model=List[OrderResponse])
def get_orders_by_customer(
    customer_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get orders by customer ID"""
    repo = OrderRepository(db)
    return repo.get_by_customer(customer_id, skip=skip, limit=limit)


@router.get("/status/{status}", response_model=List[OrderResponse])
def get_orders_by_status(
    status: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get orders by status"""
    repo = OrderRepository(db)
    return repo.get_by_status(status, skip=skip, limit=limit)


@router.get("/date-range/start/{start_date}/end/{end_date}", response_model=List[OrderResponse])
def get_orders_by_date_range(
    start_date: date,
    end_date: date,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get orders within date range"""
    repo = OrderRepository(db)
    return repo.get_by_date_range(start_date, end_date, skip=skip, limit=limit)


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db)):
    """Update an order"""
    repo = OrderRepository(db)
    updated = repo.update(order_id, order)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status: str = Query(..., description="New status: pending, completed, or cancelled"),
    db: Session = Depends(get_db)
):
    """Update order status"""
    repo = OrderRepository(db)
    if status not in ['pending', 'completed', 'cancelled']:
        raise HTTPException(status_code=400, detail="Invalid status")
    order = repo.update_status(order_id, status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order"""
    repo = OrderRepository(db)
    if not repo.delete(order_id):
        raise HTTPException(status_code=404, detail="Order not found")

