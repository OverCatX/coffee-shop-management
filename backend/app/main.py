from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api import (
    employees,
    customers,
    menu_items,
    orders,
    payments,
    inventory,
    auth,
    ingredients,
    recipes,
    stock,
)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Coffee Shop Management Database System API",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,  # Disable automatic trailing slash redirects
)


# Configure CORS
def get_cors_origins():
    """Parse CORS origins from environment variable"""
    origins_str = settings.CORS_ORIGINS
    if origins_str == "*":
        return ["*"]
    return [origin.strip() for origin in origins_str.split(",") if origin.strip()]


def get_cors_methods():
    """Parse CORS methods from environment variable"""
    methods_str = settings.CORS_ALLOW_METHODS
    if methods_str == "*":
        return ["*"]
    return [method.strip() for method in methods_str.split(",") if method.strip()]


def get_cors_headers():
    """Parse CORS headers from environment variable"""
    headers_str = settings.CORS_ALLOW_HEADERS
    if headers_str == "*":
        return ["*"]
    return [header.strip() for header in headers_str.split(",") if header.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=get_cors_methods(),
    allow_headers=get_cors_headers(),
)

# Register routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(employees.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(menu_items.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")
app.include_router(ingredients.router, prefix="/api/v1")
app.include_router(recipes.router, prefix="/api/v1")
app.include_router(stock.router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info(f"Shutting down {settings.APP_NAME}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Coffee Shop Management API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG
    )
