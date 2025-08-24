from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ...domain.entities.event import EventStatus


@dataclass
class EventCreateDTO:
    """DTO for creating a new event"""
    title: str
    description: str
    venue: str
    date_time: datetime
    capacity: int
    price: Decimal
    status: EventStatus = EventStatus.ACTIVE


@dataclass
class EventResponseDTO:
    """DTO for event response"""
    id: int
    title: str
    description: str
    venue: str
    date_time: datetime
    capacity: int
    price: Decimal
    status: EventStatus
    created_at: datetime
