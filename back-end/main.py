from typing import Union
from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import init_db, close_db
from models import User, Event, Booking, Ticket


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="Event Ticketing System API",
    description="A comprehensive event ticketing system with user management, events, bookings, and tickets",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
def read_root():
    return {
        "message": "Event Ticketing System API",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Basic endpoint examples for each entity
@app.get("/users")
async def get_users():
    """Get all users"""
    users = await User.all()
    return users


@app.get("/events")
async def get_events():
    """Get all events"""
    events = await Event.all()
    return events


@app.get("/bookings")
async def get_bookings():
    """Get all bookings with related data"""
    bookings = await Booking.all().prefetch_related("user", "event")
    return bookings


@app.get("/tickets")
async def get_tickets():
    """Get all tickets with related data"""
    tickets = await Ticket.all().prefetch_related("booking__user", "booking__event")
    return tickets