from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from contextlib import asynccontextmanager
from datetime import datetime
import secrets
import string
from database import init_db, close_db
from models import User, Event, Booking, Ticket, UserRole, EventStatus, BookingStatus, TicketStatus
from schemas import (
    UserCreate, UserResponse, EventCreate, EventResponse, 
    BookingCreate, BookingResponse, BookingWithDetails,
    TicketResponse
)


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


def generate_ticket_code() -> str:
    """Generate a unique secure ticket code"""
    length = 12
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


async def get_user_by_id(user_id: int) -> User:
    """Get user by ID or raise 404"""
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_event_by_id(event_id: int) -> Event:
    """Get event by ID or raise 404"""
    event = await Event.get_or_none(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


async def get_booking_by_id(booking_id: int) -> Booking:
    """Get booking by ID or raise 404"""
    booking = await Booking.get_or_none(id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


async def validate_admin_access(user_id: int):
    """Validate that user has admin access"""
    user = await get_user_by_id(user_id)
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
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


# Event Endpoints
@app.get("/api/events", response_model=List[EventResponse])
async def list_events():
    """Get list of all events"""
    events = await Event.all()
    return [EventResponse.model_validate(event.__dict__) for event in events]


@app.get("/api/events/{event_id}", response_model=EventResponse)
async def get_event_details(event_id: int):
    """Get event details by ID"""
    event = await get_event_by_id(event_id)
    return EventResponse.model_validate(event.__dict__)


@app.post("/api/events", response_model=EventResponse)
async def create_event(event_data: EventCreate, admin_user_id: int = 1):
    """Create new event (admin only)"""
    # In a real app, admin_user_id would come from authentication
    await validate_admin_access(admin_user_id)
    
    event = await Event.create(**event_data.model_dump())
    return EventResponse.model_validate(event.__dict__)


@app.put("/api/events/{event_id}", response_model=EventResponse)
async def update_event(event_id: int, event_data: EventCreate, admin_user_id: int = 1):
    """Update event by ID"""
    # In a real app, admin_user_id would come from authentication
    await validate_admin_access(admin_user_id)
    
    event = await get_event_by_id(event_id)
    for field, value in event_data.model_dump().items():
        setattr(event, field, value)
    await event.save()
    return EventResponse.model_validate(event.__dict__)


# Booking Endpoints
@app.post("/api/bookings", response_model=BookingResponse)
async def create_booking(booking_data: BookingCreate):
    """Create new booking with ticket availability validation"""
    # Validate user exists
    user = await get_user_by_id(booking_data.user_id)
    
    # Validate event exists and is active
    event = await get_event_by_id(booking_data.event_id)
    if event.status != EventStatus.ACTIVE:
        raise HTTPException(
            status_code=400,
            detail="Event is not active for booking"
        )
    
    # Check ticket availability
    existing_bookings = await Booking.filter(
        event_id=booking_data.event_id,
        status=BookingStatus.CONFIRMED
    ).all()
    
    total_booked = sum(booking.quantity for booking in existing_bookings)
    if total_booked + booking_data.quantity > event.capacity:
        available = event.capacity - total_booked
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient tickets. Available: {available}, Requested: {booking_data.quantity}"
        )
    
    # Calculate total amount
    total_amount = event.price * booking_data.quantity
    
    # Create booking
    booking = await Booking.create(
        user_id=booking_data.user_id,
        event_id=booking_data.event_id,
        quantity=booking_data.quantity,
        total_amount=total_amount
    )
    
    # Generate individual tickets
    for _ in range(booking_data.quantity):
        ticket_code = generate_ticket_code()
        # Ensure uniqueness
        while await Ticket.filter(ticket_code=ticket_code).exists():
            ticket_code = generate_ticket_code()
        
        await Ticket.create(
            booking_id=booking.id,
            ticket_code=ticket_code
        )
    
    return BookingResponse.model_validate(booking.__dict__)


@app.get("/api/bookings/user/{user_id}", response_model=List[BookingWithDetails])
async def list_user_bookings(user_id: int):
    """Get list of bookings for a specific user"""
    user = await get_user_by_id(user_id)
    
    bookings = await Booking.filter(user_id=user_id).prefetch_related(
        "user", "event", "tickets"
    ).all()
    
    result = []
    for booking in bookings:
        booking_dict = booking.__dict__
        booking_dict["user"] = UserResponse.model_validate(booking.user.__dict__)
        booking_dict["event"] = EventResponse.model_validate(booking.event.__dict__)
        booking_dict["tickets"] = [
            TicketResponse.model_validate(ticket.__dict__) 
            for ticket in booking.tickets
        ]
        result.append(BookingWithDetails.model_validate(booking_dict))
    
    return result


@app.get("/api/bookings/event/{event_id}", response_model=List[BookingWithDetails])
async def list_event_bookings(event_id: int, admin_user_id: int = 1):
    """Get list of bookings for a specific event (admin only)"""
    # In a real app, admin_user_id would come from authentication
    await validate_admin_access(admin_user_id)
    
    event = await get_event_by_id(event_id)
    
    bookings = await Booking.filter(event_id=event_id).prefetch_related(
        "user", "event", "tickets"
    ).all()
    
    result = []
    for booking in bookings:
        booking_dict = booking.__dict__
        booking_dict["user"] = UserResponse.model_validate(booking.user.__dict__)
        booking_dict["event"] = EventResponse.model_validate(booking.event.__dict__)
        booking_dict["tickets"] = [
            TicketResponse.model_validate(ticket.__dict__) 
            for ticket in booking.tickets
        ]
        result.append(BookingWithDetails.model_validate(booking_dict))
    
    return result


@app.put("/api/bookings/{booking_id}", response_model=BookingResponse)
async def update_booking_status(booking_id: int, status: BookingStatus):
    """Update booking status"""
    booking = await get_booking_by_id(booking_id)
    
    booking.status = status
    await booking.save()
    
    # Update related tickets status when booking is cancelled
    if status == BookingStatus.CANCELLED:
        await Ticket.filter(booking_id=booking_id).update(status=TicketStatus.CANCELLED)
    
    return BookingResponse.model_validate(booking.__dict__)


# User Endpoints
@app.get("/api/users", response_model=List[UserResponse])
async def list_users():
    """Get list of all users"""
    users = await User.all()
    return [UserResponse.model_validate(user.__dict__) for user in users]


@app.post("/api/users", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    """Create new user"""
    # Check if phone number already exists
    existing_user = await User.filter(phone=user_data.phone).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )
    
    user = await User.create(**user_data.model_dump())
    return UserResponse.model_validate(user.__dict__)