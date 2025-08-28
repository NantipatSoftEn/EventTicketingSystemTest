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


@dataclass
class EventManagementDTO:
    """DTO for event management view with all statistics"""
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
