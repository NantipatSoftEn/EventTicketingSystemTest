"""
Clean Architecture FastAPI Application
Event Ticketing System with proper separation of concerns and API versioning
"""

from typing import List
from fastapi import FastAPI, HTTPException, status, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Infrastructure
from src.infrastructure.database.connection import init_db, close_db

# API versioning
from src.presentation.api.v1.router import api_v1_router
from src.presentation.api.versioning import create_version_info_endpoint

# Presentation schemas
from src.presentation.schemas.api_response_schemas import ApiResponse

# Response utilities
from src.presentation.utils.response_utils import prepare_response_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="Event Ticketing System API - Clean Architecture",
    description="A comprehensive event ticketing system built with Clean Architecture principles and API versioning",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Exception handlers for consistent API responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent response format"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "data": None
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with consistent response format"""
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error",
            "data": {
                "errors": exc.errors()
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions with consistent response format"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "data": None
        }
    )


# Include API versioning routers
app.include_router(api_v1_router, prefix="/api/v1")

# Include version info endpoint
version_router = create_version_info_endpoint()
app.include_router(version_router)


# Health check endpoints
@app.get("/", response_model=ApiResponse[dict])
def read_root():
    data = {
        "message": "Event Ticketing System API - Clean Architecture",
        "version": "2.0.0",
        "status": "active",
        "architecture": "Clean Architecture with Domain-Driven Design",
        "api_versions": {
            "current": "v1",
            "available": ["v1"],
            "endpoints": {
                "v1": "/api/v1",
                "docs": "/docs",
                "health": "/health"
            }
        }
    }
    return ApiResponse.success_response(
        data=data,
        message="Welcome to Event Ticketing System API"
    )


@app.get("/health", response_model=ApiResponse[dict])
def health_check():
    data = {
        "status": "healthy", 
        "architecture": "clean",
        "version": "2.0.0",
        "api_version": "v1"
    }
    return ApiResponse.success_response(
        data=data,
        message="System is healthy"
    )


# Additional utility endpoints
@app.get("/api/v1/architecture", response_model=ApiResponse[dict])
def get_architecture_info():
    """Get information about the clean architecture implementation"""
    data = {
        "architecture": "Clean Architecture",
        "layers": {
            "domain": {
                "description": "Core business logic and entities",
                "components": ["Entities", "Repository Interfaces", "Domain Services"]
            },
            "application": {
                "description": "Application-specific business rules",
                "components": ["Use Cases", "DTOs", "Application Services"]
            },
            "infrastructure": {
                "description": "External frameworks and tools",
                "components": ["Database", "Repository Implementations", "ORM Models"]
            },
            "presentation": {
                "description": "User interface and external interfaces",
                "components": ["Controllers", "Schemas", "API Routes"]
            }
        },
        "principles": [
            "Dependency Inversion",
            "Single Responsibility",
            "Open/Closed Principle",
            "Interface Segregation",
            "Separation of Concerns"
        ],
        "benefits": [
            "Testability",
            "Maintainability", 
            "Flexibility",
            "Independence from frameworks",
            "Clear separation of concerns"
        ],
        "api_versioning": {
            "strategy": "URL versioning",
            "current_version": "v1",
            "version_format": "/api/v{version}"
        }
    }
    return ApiResponse.success_response(
        data=data,
        message="Architecture information retrieved successfully"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
