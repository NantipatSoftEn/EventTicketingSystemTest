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
