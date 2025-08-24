from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.booking import Booking, BookingStatus


class BookingRepository(ABC):
    """Abstract repository interface for Booking entity"""
    
    @abstractmethod
    async def create(self, booking: Booking) -> Booking:
        """Create a new booking"""
        pass
    
    @abstractmethod
    async def get_by_id(self, booking_id: int) -> Optional[Booking]:
        """Get booking by ID"""
        pass
    
    @abstractmethod
    async def get_all(self) -> List[Booking]:
        """Get all bookings"""
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> List[Booking]:
        """Get bookings by user ID"""
        pass
    
    @abstractmethod
    async def get_by_event_id(self, event_id: int) -> List[Booking]:
        """Get bookings by event ID"""
        pass
    
    @abstractmethod
    async def get_confirmed_bookings_for_event(self, event_id: int) -> List[Booking]:
        """Get confirmed bookings for an event"""
        pass
    
    @abstractmethod
    async def update(self, booking: Booking) -> Booking:
        """Update existing booking"""
        pass
    
    @abstractmethod
    async def delete(self, booking_id: int) -> bool:
        """Delete booking by ID"""
        pass
    
    @abstractmethod
    async def get_total_booked_quantity_for_event(self, event_id: int) -> int:
        """Get total booked quantity for an event"""
        pass
