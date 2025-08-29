"""
API v1 Router
Main router for version 1 of the API
"""

from fastapi import APIRouter
from .endpoints import users, events, bookings, event_availability

# Create main v1 router
api_v1_router = APIRouter()

# Include all endpoint routers
api_v1_router.include_router(users.router, prefix="/users", tags=["users"])
api_v1_router.include_router(events.router, prefix="/events", tags=["events"])
api_v1_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_v1_router.include_router(event_availability.router, prefix="/availability", tags=["availability"])
