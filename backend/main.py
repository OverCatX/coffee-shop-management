"""
Entry point for running the FastAPI application.
This file allows running uvicorn with: uvicorn main:app --reload
"""

from app.main import app

__all__ = ["app"]
