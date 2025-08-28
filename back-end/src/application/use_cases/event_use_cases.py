from typing import List
from datetime import datetime
from ...domain.entities.event import Event, EventStatus
from ...domain.repositories.event_repository import EventRepository
from ..dtos.event_dto import EventCreateDTO, EventResponseDTO, EventManagementDTO


class EventUseCases:
    """Application use cases for event operations"""
    
    def __init__(self, event_repository: EventRepository):
        self._event_repository = event_repository
    
    async def create_event(self, event_dto: EventCreateDTO) -> EventResponseDTO:
        """Create a new event"""
        # Create domain entity
        event = Event(
            id=None,
            title=event_dto.title,
            description=event_dto.description,
            venue=event_dto.venue,
            date_time=event_dto.date_time,
            capacity=event_dto.capacity,
            price=event_dto.price,
            status=event_dto.status,
            created_at=datetime.now()
        )
        
        # Save event
        created_event = await self._event_repository.create(event)
        
        # Return DTO
        return EventResponseDTO(
            id=created_event.id,
            title=created_event.title,
            description=created_event.description,
            venue=created_event.venue,
            date_time=created_event.date_time,
            capacity=created_event.capacity,
            price=created_event.price,
            status=created_event.status,
            created_at=created_event.created_at
        )
    
    async def get_event_by_id(self, event_id: int) -> EventResponseDTO:
        """Get event by ID"""
        event = await self._event_repository.get_by_id(event_id)
        if not event:
            raise ValueError("Event not found")
        
        return EventResponseDTO(
            id=event.id,
            title=event.title,
            description=event.description,
            venue=event.venue,
            date_time=event.date_time,
            capacity=event.capacity,
            price=event.price,
            status=event.status,
            created_at=event.created_at
        )
    
    async def get_all_events(self) -> List[EventResponseDTO]:
        """Get all events"""
        events = await self._event_repository.get_all()
        
        return [
            EventResponseDTO(
                id=event.id,
                title=event.title,
                description=event.description,
                venue=event.venue,
                date_time=event.date_time,
                capacity=event.capacity,
                price=event.price,
                status=event.status,
                created_at=event.created_at
            )
            for event in events
        ]
    
    async def update_event(self, event_id: int, event_dto: EventCreateDTO) -> EventResponseDTO:
        """Update an existing event"""
        existing_event = await self._event_repository.get_by_id(event_id)
        if not existing_event:
            raise ValueError("Event not found")
        
        # Update domain entity
        updated_event = Event(
            id=existing_event.id,
            title=event_dto.title,
            description=event_dto.description,
            venue=event_dto.venue,
            date_time=event_dto.date_time,
            capacity=event_dto.capacity,
            price=event_dto.price,
            status=event_dto.status,
            created_at=existing_event.created_at
        )
        
        # Save updated event
        saved_event = await self._event_repository.update(updated_event)
        
        # Return DTO
        return EventResponseDTO(
            id=saved_event.id,
            title=saved_event.title,
            description=saved_event.description,
            venue=saved_event.venue,
            date_time=saved_event.date_time,
            capacity=saved_event.capacity,
            price=saved_event.price,
            status=saved_event.status,
            created_at=saved_event.created_at
        )
    
    async def delete_event(self, event_id: int) -> bool:
        """Delete an event"""
        # Check if event exists
        existing_event = await self._event_repository.get_by_id(event_id)
        if not existing_event:
            raise ValueError("Event not found")
        
        # Delete the event
        deleted = await self._event_repository.delete(event_id)
        return deleted

    async def get_events_for_management(self) -> List[EventManagementDTO]:
        """Get all events with complete statistics for management view"""
        events = await self._event_repository.get_all()
        
        return [
            EventManagementDTO(
                id=event.id,
                title=event.title,
                description=event.description,
                venue=event.venue,
                date_time=event.date_time,
                capacity=event.capacity,
                price=event.price,
                status=event.status,
                created_at=event.created_at,
                total_tickets_sold=event.total_tickets_sold or 0,
                available_tickets=event.get_available_tickets(),
                total_revenue=event.total_revenue or 0,
                total_bookings=event.total_bookings or 0,
                occupancy_percentage=event.get_occupancy_percentage(),
                potential_revenue=event.get_potential_revenue()
            )
            for event in events
        ]
