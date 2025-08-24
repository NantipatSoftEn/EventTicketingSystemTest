from typing import List
from ..repositories.booking_repository import BookingRepository
from ..repositories.event_repository import EventRepository
from ..entities.booking import Booking
from ..entities.event import Event


class BookingService:
    """Domain service for booking-related business logic"""
    
    def __init__(self, booking_repository: BookingRepository, event_repository: EventRepository):
        self._booking_repository = booking_repository
        self._event_repository = event_repository
    
    async def validate_booking_availability(self, event_id: int, requested_quantity: int) -> None:
        """Validate if tickets are available for booking"""
        event = await self._event_repository.get_by_id(event_id)
        if not event:
            raise ValueError("Event not found")
        
        if not event.is_bookable():
            raise ValueError("Event is not available for booking")
        
        # Get total confirmed bookings for the event
        total_booked = await self._booking_repository.get_total_booked_quantity_for_event(event_id)
        
        available_capacity = event.capacity - total_booked
        
        if requested_quantity > available_capacity:
            raise ValueError(
                f"Insufficient tickets. Available: {available_capacity}, Requested: {requested_quantity}"
            )
    
    async def get_available_capacity(self, event_id: int) -> int:
        """Get available capacity for an event"""
        event = await self._event_repository.get_by_id(event_id)
        if not event:
            raise ValueError("Event not found")
        
        total_booked = await self._booking_repository.get_total_booked_quantity_for_event(event_id)
        return event.capacity - total_booked
    
    async def cancel_booking(self, booking_id: int) -> Booking:
        """Cancel a booking"""
        booking = await self._booking_repository.get_by_id(booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        booking.cancel()
        return await self._booking_repository.update(booking)
