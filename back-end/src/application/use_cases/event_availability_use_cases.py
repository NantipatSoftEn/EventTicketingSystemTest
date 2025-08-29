"""
Event availability use cases for real-time ticket availability
"""

from typing import Dict, List
from ...domain.repositories.event_repository import EventRepository
from ...domain.repositories.booking_repository import BookingRepository
from ..dtos.event_dto import EventAvailabilityDTO


class EventAvailabilityUseCases:
    """Use cases for event availability operations"""
    
    def __init__(self, event_repository: EventRepository, booking_repository: BookingRepository):
        self._event_repository = event_repository
        self._booking_repository = booking_repository
    
    async def get_event_availability(self, event_id: int) -> EventAvailabilityDTO:
        """Get real-time availability for a specific event"""
        event = await self._event_repository.get_by_id(event_id)
        if not event:
            raise ValueError("Event not found")
        
        # Get total confirmed bookings for the event
        total_booked = await self._booking_repository.get_total_booked_quantity_for_event(event_id)
        available_tickets = event.capacity - total_booked
        
        # Calculate occupancy percentage
        occupancy_percentage = (total_booked / event.capacity * 100) if event.capacity > 0 else 0
        
        return EventAvailabilityDTO(
            event_id=event_id,
            total_capacity=event.capacity,
            booked_tickets=total_booked,
            available_tickets=available_tickets,
            occupancy_percentage=round(occupancy_percentage, 2),
            is_sold_out=available_tickets <= 0,
            is_almost_sold_out=available_tickets <= (event.capacity * 0.1),  # 10% threshold
            event_status=event.status,
            last_updated=None  # Will be set by the controller
        )
    
    async def get_multiple_events_availability(self, event_ids: List[int]) -> Dict[int, EventAvailabilityDTO]:
        """Get availability for multiple events in one call"""
        availability_map = {}
        
        for event_id in event_ids:
            try:
                availability = await self.get_event_availability(event_id)
                availability_map[event_id] = availability
            except ValueError:
                # Skip events that don't exist
                continue
        
        return availability_map
    
    async def get_all_active_events_availability(self) -> Dict[int, EventAvailabilityDTO]:
        """Get availability for all active events"""
        events = await self._event_repository.get_all_active()
        event_ids = [event.id for event in events]
        return await self.get_multiple_events_availability(event_ids)
