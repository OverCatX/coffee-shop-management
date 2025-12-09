from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer"""
    repo = CustomerRepository(db)
    return repo.create(customer)


@router.get("/", response_model=List[CustomerResponse])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all customers"""
    repo = CustomerRepository(db)
    return repo.get_all(skip=skip, limit=limit)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get customer by ID"""
    repo = CustomerRepository(db)
    customer = repo.get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.get("/search/query", response_model=List[CustomerResponse])
def search_customers(
    q: str = Query(..., description="Search query"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Search customers by name, phone, or email"""
    repo = CustomerRepository(db)
    return repo.search(q, skip=skip, limit=limit)


@router.get("/phone/{phone}", response_model=CustomerResponse)
def get_customer_by_phone(phone: str, db: Session = Depends(get_db)):
    """Get customer by phone number"""
    repo = CustomerRepository(db)
    customer = repo.get_by_phone(phone)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)
):
    """Update a customer"""
    repo = CustomerRepository(db)
    updated = repo.update(customer_id, customer)
    if not updated:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer"""
    repo = CustomerRepository(db)
    if not repo.delete(customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")


@router.post("/{customer_id}/loyalty-points", response_model=CustomerResponse)
def update_loyalty_points(
    customer_id: int,
    points: float = Query(..., description="Points to add (can be negative)"),
    db: Session = Depends(get_db),
):
    """Update customer loyalty points"""
    repo = CustomerRepository(db)
    customer = repo.update_loyalty_points(customer_id, points)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
