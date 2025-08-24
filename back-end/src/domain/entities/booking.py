from dataclasses import dataclass
from enum import Enum
from typing import Optional
from datetime import datetime
from decimal import Decimal


class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


@dataclass
class Booking:
    """Booking domain entity representing user bookings for events"""
    id: Optional[int]
    user_id: int
    event_id: int
    quantity: int
    total_amount: Decimal
    booking_date: Optional[datetime]
    status: BookingStatus
    
    def __post_init__(self):
        if self.user_id <= 0:
            raise ValueError("User ID must be positive")
        
        if self.event_id <= 0:
            raise ValueError("Event ID must be positive")
        
        if self.quantity <= 0:
            raise ValueError("Booking quantity must be positive")
        
        if self.total_amount <= 0:
            raise ValueError("Total amount must be positive")
    
    def is_confirmed(self) -> bool:
        """Check if booking is confirmed"""
        return self.status == BookingStatus.CONFIRMED
    
    def is_cancelled(self) -> bool:
        """Check if booking is cancelled"""
        return self.status == BookingStatus.CANCELLED
    
    def cancel(self) -> None:
        """Cancel the booking"""
        if self.is_cancelled():
            raise ValueError("Booking is already cancelled")
        self.status = BookingStatus.CANCELLED
    
    def confirm(self) -> None:
        """Confirm the booking"""
        if self.is_confirmed():
            raise ValueError("Booking is already confirmed")
        self.status = BookingStatus.CONFIRMED
