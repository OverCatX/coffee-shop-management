from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.core.logging import logger


class CustomerRepository:
    """Repository for Customer operations with query optimization"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, customer_id: int) -> Optional[Customer]:
        """Get customer by ID with relationships"""
        return self.db.query(Customer).filter(
            and_(Customer.customer_id == customer_id, Customer.is_deleted == False)
        ).options(
            joinedload(Customer.orders)
        ).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Customer]:
        """Get all customers with pagination"""
        return self.db.query(Customer).filter(
            Customer.is_deleted == False
        ).offset(skip).limit(limit).all()

    def get_by_phone(self, phone: str) -> Optional[Customer]:
        """Get customer by phone number"""
        return self.db.query(Customer).filter(
            and_(Customer.phone == phone, Customer.is_deleted == False)
        ).first()

    def get_by_email(self, email: str) -> Optional[Customer]:
        """Get customer by email"""
        return self.db.query(Customer).filter(
            and_(Customer.email == email, Customer.is_deleted == False)
        ).first()

    def search(self, query: str, skip: int = 0, limit: int = 100) -> List[Customer]:
        """Search customers by name, phone, or email"""
        search_filter = or_(
            Customer.name.ilike(f"%{query}%"),
            Customer.phone.ilike(f"%{query}%"),
            Customer.email.ilike(f"%{query}%")
        )
        return self.db.query(Customer).filter(
            and_(search_filter, Customer.is_deleted == False)
        ).offset(skip).limit(limit).all()

    def create(self, customer_data: CustomerCreate) -> Customer:
        """Create a new customer"""
        customer_dict = customer_data.model_dump()
        customer = Customer(**customer_dict)
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        logger.info(f"Created customer: {customer.customer_id}")
        return customer

    def update(self, customer_id: int, customer_data: CustomerUpdate) -> Optional[Customer]:
        """Update an existing customer"""
        customer = self.get(customer_id)
        if not customer:
            return None
        
        update_data = customer_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(customer, field, value)
        
        self.db.commit()
        self.db.refresh(customer)
        logger.info(f"Updated customer: {customer_id}")
        return customer

    def delete(self, customer_id: int) -> bool:
        """Soft delete a customer"""
        customer = self.get(customer_id)
        if not customer:
            return False
        
        customer.is_deleted = True
        self.db.commit()
        logger.info(f"Deleted customer: {customer_id}")
        return True

    def update_loyalty_points(self, customer_id: int, points: float) -> Optional[Customer]:
        """Update customer loyalty points"""
        customer = self.get(customer_id)
        if not customer:
            return None
        
        customer.loyalty_points += points
        self.db.commit()
        self.db.refresh(customer)
        logger.info(f"Updated loyalty points for customer: {customer_id}")
        return customer

