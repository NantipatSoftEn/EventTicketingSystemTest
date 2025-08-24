from dataclasses import dataclass
from enum import Enum
from typing import Optional


class TicketStatus(str, Enum):
    ACTIVE = "active"
    USED = "used"
    CANCELLED = "cancelled"


@dataclass
class Ticket:
    """Ticket domain entity representing individual tickets from bookings"""
    id: Optional[int]
    booking_id: int
    ticket_code: str
    status: TicketStatus
    
    def __post_init__(self):
        if self.booking_id <= 0:
            raise ValueError("Booking ID must be positive")
        
        if not self.ticket_code or len(self.ticket_code.strip()) == 0:
            raise ValueError("Ticket code cannot be empty")
        
        if len(self.ticket_code) < 8:
            raise ValueError("Ticket code must be at least 8 characters")
    
    def is_active(self) -> bool:
        """Check if ticket is active"""
        return self.status == TicketStatus.ACTIVE
    
    def is_used(self) -> bool:
        """Check if ticket is used"""
        return self.status == TicketStatus.USED
    
    def is_cancelled(self) -> bool:
        """Check if ticket is cancelled"""
        return self.status == TicketStatus.CANCELLED
    
    def use(self) -> None:
        """Mark ticket as used"""
        if not self.is_active():
            raise ValueError("Only active tickets can be used")
        self.status = TicketStatus.USED
    
    def cancel(self) -> None:
        """Cancel the ticket"""
        if self.is_cancelled():
            raise ValueError("Ticket is already cancelled")
        if self.is_used():
            raise ValueError("Used tickets cannot be cancelled")
        self.status = TicketStatus.CANCELLED
