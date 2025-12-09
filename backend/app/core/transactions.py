from functools import wraps
from sqlalchemy.orm import Session
from app.core.logging import logger


def transactional(func):
    """Decorator for ensuring database transactions"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Find db session in args or kwargs
        db = None
        for arg in args:
            if isinstance(arg, Session):
                db = arg
                break
        
        if not db:
            db = kwargs.get('db')
        
        if not db:
            raise ValueError("Database session not found")
        
        try:
            result = func(*args, **kwargs)
            db.commit()
            logger.info(f"Transaction committed for {func.__name__}")
            return result
        except Exception as e:
            db.rollback()
            logger.error(f"Transaction rolled back for {func.__name__}: {str(e)}")
            raise
    
    return wrapper


class TransactionManager:
    """Context manager for database transactions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def __enter__(self):
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.db.rollback()
            logger.error(f"Transaction rolled back due to exception: {exc_val}")
        else:
            self.db.commit()
            logger.info("Transaction committed")
        return False

