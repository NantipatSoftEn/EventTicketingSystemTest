from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from ...domain.entities.booking import BookingStatus
from .user_dto import UserResponseDTO
from .event_dto import EventResponseDTO
from .ticket_dto import TicketResponseDTO


@dataclass
class BookingCreateDTO:
    """DTO for creating a new booking"""
    user_id: int
    event_id: int
    quantity: int


@dataclass
class BookingResponseDTO:
    """DTO for booking response"""
    id: int
    user_id: int
    event_id: int
    quantity: int
    total_amount: Decimal
    booking_date: datetime
    status: BookingStatus


@dataclass
class BookingWithDetailsDTO:
    """DTO for booking response with user, event, and ticket details"""
    id: int
    user_id: int
    event_id: int
    quantity: int
    total_amount: Decimal
    booking_date: datetime
    status: BookingStatus
    user: UserResponseDTO
    event: EventResponseDTO
    tickets: List[TicketResponseDTO]
