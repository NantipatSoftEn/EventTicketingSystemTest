from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from models import UserRole, EventStatus, BookingStatus, TicketStatus


# User Schemas
class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    role: UserRole = UserRole.CUSTOMER


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True


# Event Schemas
class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    venue: str = Field(..., min_length=1, max_length=200)
    date_time: datetime
    capacity: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    status: EventStatus = EventStatus.ACTIVE


class EventCreate(EventBase):
    pass


class EventResponse(EventBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Booking Schemas
class BookingBase(BaseModel):
    quantity: int = Field(..., gt=0)


class BookingCreate(BookingBase):
    user_id: int
    event_id: int


class BookingResponse(BookingBase):
    id: int
    user_id: int
    event_id: int
    total_amount: Decimal
    booking_date: datetime
    status: BookingStatus
    
    class Config:
        from_attributes = True


class BookingWithDetails(BookingResponse):
    user: UserResponse
    event: EventResponse
    tickets: List["TicketResponse"] = []


# Ticket Schemas
class TicketBase(BaseModel):
    ticket_code: str = Field(..., min_length=1, max_length=50)
    status: TicketStatus = TicketStatus.ACTIVE


class TicketCreate(TicketBase):
    booking_id: int


class TicketResponse(TicketBase):
    id: int
    booking_id: int
    
    class Config:
        from_attributes = True


class TicketWithDetails(TicketResponse):
    booking: BookingResponse


# Update forward references
BookingWithDetails.model_rebuild()
