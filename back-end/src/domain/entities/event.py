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
    
    def _get_current_datetime(self) -> datetime:
        """Get current datetime in the same timezone as event datetime"""
        now = datetime.now()
        if self.date_time.tzinfo is not None:
            # If event datetime is timezone-aware, make now timezone-aware too
            if now.tzinfo is None:
                now = now.replace(tzinfo=self.date_time.tzinfo)
        else:
            # If event datetime is naive, ensure now is also naive
            if now.tzinfo is not None:
                now = now.replace(tzinfo=None)
        return now
    
    def __post_init__(self):
        if not self.title or len(self.title.strip()) == 0:
            raise ValueError("Event title cannot be empty")
        
        if not self.venue or len(self.venue.strip()) == 0:
            raise ValueError("Event venue cannot be empty")
        
        if self.capacity <= 0:
            raise ValueError("Event capacity must be positive")
        
        if self.price <= 0:
            raise ValueError("Event price must be positive")
        
        # Only validate date for new events (not when loading from database)
        if self.id is None and self.date_time <= self._get_current_datetime():
            raise ValueError("Event date must be in the future")
    
    def is_active(self) -> bool:
        """Check if event is active for booking"""
        return self.status == EventStatus.ACTIVE
    
    def is_bookable(self) -> bool:
        """Check if event can accept new bookings"""
        return self.is_active() and self.date_time > self._get_current_datetime()
    
    def calculate_total_price(self, quantity: int) -> Decimal:
        """Calculate total price for given quantity"""
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        return self.price * quantity
