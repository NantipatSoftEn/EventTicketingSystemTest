from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from decimal import Decimal
from ...domain.entities.booking import BookingStatus
from .user_schemas import UserResponseSchema
from .event_schemas import EventResponseSchema
from .ticket_schemas import TicketResponseSchema


class BookingCreateSchema(BaseModel):
    """Pydantic schema for creating a new booking"""
    user_id: int = Field(..., gt=0)
    event_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class BookingResponseSchema(BaseModel):
    """Pydantic schema for booking response"""
    id: int
    user_id: int
    event_id: int
    quantity: int
    total_amount: Decimal
    booking_date: datetime
    status: BookingStatus
    
    class Config:
        from_attributes = True


class BookingWithDetailsSchema(BaseModel):
    """Pydantic schema for booking response with user, event, and ticket details"""
    id: int
    user_id: int
    event_id: int
    quantity: int
    total_amount: Decimal
    booking_date: datetime
    status: BookingStatus
    user: UserResponseSchema
    event: EventResponseSchema
    tickets: List[TicketResponseSchema]
    
    class Config:
        from_attributes = True
