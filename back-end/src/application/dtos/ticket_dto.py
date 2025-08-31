from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from ...domain.entities.ticket import TicketStatus


@dataclass
class TicketResponseDTO:
    """DTO for ticket response"""
    id: int
    booking_id: int
    ticket_code: str
    status: TicketStatus


@dataclass
class TicketValidationRequestDTO:
    """DTO for ticket validation request"""
    ticket_code: str


@dataclass
class TicketValidationResponseDTO:
    """DTO for ticket validation response"""
    ticket_code: str
    status: TicketStatus
    is_valid: bool
    message: str
    booking_id: Optional[int] = None
    event_name: Optional[str] = None
    event_date: Optional[datetime] = None
    user_name: Optional[str] = None
