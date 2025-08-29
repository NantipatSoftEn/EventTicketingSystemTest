"""
Event availability schemas for API responses
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict
from ...domain.entities.event import EventStatus


class EventAvailabilitySchema(BaseModel):
    """Schema for event availability response"""
    event_id: int
    total_capacity: int
    booked_tickets: int
    available_tickets: int
    occupancy_percentage: float
    is_sold_out: bool
    is_almost_sold_out: bool
    event_status: EventStatus
    last_updated: Optional[datetime] = None

    class Config:
        use_enum_values = True


class MultipleEventAvailabilitySchema(BaseModel):
    """Schema for multiple events availability response"""
    events: Dict[int, EventAvailabilitySchema]
    last_updated: datetime

    class Config:
        use_enum_values = True
