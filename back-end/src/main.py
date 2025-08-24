"""
Clean Architecture FastAPI Application
Event Ticketing System with proper separation of concerns
"""

from typing import List
from fastapi import FastAPI, HTTPException, status, Depends
from contextlib import asynccontextmanager

# Infrastructure
from src.infrastructure.database.connection import init_db, close_db

# Presentation schemas
from src.presentation.schemas.user_schemas import UserCreateSchema, UserResponseSchema
from src.presentation.schemas.event_schemas import EventCreateSchema, EventResponseSchema
from src.presentation.schemas.booking_schemas import (
    BookingCreateSchema, BookingResponseSchema, BookingWithDetailsSchema
)

# Domain entities
from src.domain.entities.booking import BookingStatus

# Dependency injection
from src.container import container


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="Event Ticketing System API - Clean Architecture",
    description="A comprehensive event ticketing system built with Clean Architecture principles",
    version="2.0.0",
    lifespan=lifespan
)


# Health check endpoints
@app.get("/")
def read_root():
    return {
        "message": "Event Ticketing System API - Clean Architecture",
        "version": "2.0.0",
        "status": "active",
        "architecture": "Clean Architecture with Domain-Driven Design"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "architecture": "clean"}


# User endpoints
@app.post("/api/users", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreateSchema):
    """Create a new user"""
    return await container.user_controller.create_user(user_data)


@app.get("/api/users", response_model=List[UserResponseSchema])
async def list_users():
    """Get all users"""
    return await container.user_controller.get_all_users()


@app.get("/api/users/{user_id}", response_model=UserResponseSchema)
async def get_user(user_id: int):
    """Get user by ID"""
    return await container.user_controller.get_user_by_id(user_id)


# Event endpoints
@app.post("/api/events", response_model=EventResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_event(event_data: EventCreateSchema, admin_user_id: int = 1):
    """Create a new event (admin only)"""
    return await container.event_controller.create_event(event_data, admin_user_id)


@app.get("/api/events", response_model=List[EventResponseSchema])
async def list_events():
    """Get all events"""
    return await container.event_controller.get_all_events()


@app.get("/api/events/{event_id}", response_model=EventResponseSchema)
async def get_event(event_id: int):
    """Get event by ID"""
    return await container.event_controller.get_event_by_id(event_id)


@app.put("/api/events/{event_id}", response_model=EventResponseSchema)
async def update_event(event_id: int, event_data: EventCreateSchema, admin_user_id: int = 1):
    """Update event by ID (admin only)"""
    return await container.event_controller.update_event(event_id, event_data, admin_user_id)


# Booking endpoints
@app.post("/api/bookings", response_model=BookingResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_booking(booking_data: BookingCreateSchema):
    """Create a new booking with automatic ticket generation"""
    return await container.booking_controller.create_booking(booking_data)


@app.get("/api/bookings/user/{user_id}", response_model=List[BookingWithDetailsSchema])
async def get_user_bookings(user_id: int):
    """Get bookings for a specific user with full details"""
    return await container.booking_controller.get_user_bookings(user_id)


@app.get("/api/bookings/event/{event_id}", response_model=List[BookingWithDetailsSchema])
async def get_event_bookings(event_id: int, admin_user_id: int = 1):
    """Get bookings for a specific event with full details (admin only)"""
    return await container.booking_controller.get_event_bookings(event_id, admin_user_id)


@app.put("/api/bookings/{booking_id}/status", response_model=BookingResponseSchema)
async def update_booking_status(booking_id: int, status: BookingStatus):
    """Update booking status (automatically handles ticket status updates)"""
    return await container.booking_controller.update_booking_status(booking_id, status)


# Additional utility endpoints
@app.get("/api/architecture")
def get_architecture_info():
    """Get information about the clean architecture implementation"""
    return {
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
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
