from dataclasses import dataclass
from enum import Enum
from typing import Optional
from datetime import datetime
from decimal import Decimal


class EventStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled" 
    COMPLETED = "completed"


@dataclass
class Event:
    """Event domain entity representing ticketed events"""
    id: Optional[int]
    title: str
    description: str
    venue: str
    date_time: datetime
    capacity: int
    price: Decimal
    status: EventStatus
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if not self.title or len(self.title.strip()) == 0:
            raise ValueError("Event title cannot be empty")
        
        if not self.venue or len(self.venue.strip()) == 0:
            raise ValueError("Event venue cannot be empty")
        
        if self.capacity <= 0:
            raise ValueError("Event capacity must be positive")
        
        if self.price <= 0:
            raise ValueError("Event price must be positive")
        
        if self.date_time <= datetime.now():
            # Allow past dates for completed events
            if self.status != EventStatus.COMPLETED:
                raise ValueError("Event date must be in the future for active events")
    
    def is_active(self) -> bool:
        """Check if event is active for booking"""
        return self.status == EventStatus.ACTIVE
    
    def is_bookable(self) -> bool:
        """Check if event can accept new bookings"""
        return self.is_active() and self.date_time > datetime.now()
    
    def calculate_total_price(self, quantity: int) -> Decimal:
        """Calculate total price for given quantity"""
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        return self.price * quantity
