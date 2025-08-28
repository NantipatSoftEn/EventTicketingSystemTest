from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from ...domain.entities.event import EventStatus


class EventCreateSchema(BaseModel):
    """Pydantic schema for creating a new event"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    venue: str = Field(..., min_length=1, max_length=200)
    date_time: datetime
    capacity: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    status: EventStatus = EventStatus.ACTIVE


class EventPatchSchema(BaseModel):
    """Pydantic schema for partially updating an event"""
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    venue: str | None = Field(None, min_length=1, max_length=200)
    date_time: datetime | None = None
    capacity: int | None = Field(None, gt=0)
    price: Decimal | None = Field(None, gt=0)
    status: EventStatus | None = None


class EventResponseSchema(BaseModel):
    """Pydantic schema for event response"""
    id: int
    title: str
    description: str
    venue: str
    date_time: datetime
    capacity: int
    price: Decimal
    status: EventStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


class EventManagementSchema(BaseModel):
    """Pydantic schema for event management view with statistics"""
    id: int
    title: str
    description: str
    venue: str
    date_time: datetime
    capacity: int
    price: Decimal
    status: EventStatus
    created_at: datetime
    # Statistics fields
    total_tickets_sold: int
    available_tickets: int
    total_revenue: Decimal
    total_bookings: int
    occupancy_percentage: float
    potential_revenue: Decimal
    
    class Config:
        from_attributes = True
