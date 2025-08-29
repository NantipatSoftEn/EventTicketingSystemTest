from typing import List, Optional
from ...domain.entities.event import Event, EventStatus
from ...domain.repositories.event_repository import EventRepository
from ..database.models.event_model import EventModel


class EventRepositoryImpl(EventRepository):
    """Tortoise ORM implementation of EventRepository"""
    
    async def create(self, event: Event) -> Event:
        """Create a new event"""
        event_model = await EventModel.create(
            title=event.title,
            description=event.description,
            venue=event.venue,
            date_time=event.date_time,
            capacity=event.capacity,
            price=event.price,
            status=event.status
        )
        
        return Event(
            id=event_model.id,
            title=event_model.title,
            description=event_model.description,
            venue=event_model.venue,
            date_time=event_model.date_time,
            capacity=event_model.capacity,
            price=event_model.price,
            status=event_model.status,
            created_at=event_model.created_at
        )
    
    async def get_by_id(self, event_id: int) -> Optional[Event]:
        """Get event by ID"""
        event_model = await EventModel.get_or_none(id=event_id)
        if not event_model:
            return None

        return Event(
            id=event_model.id,
            title=event_model.title,
            description=event_model.description,
            venue=event_model.venue,
            date_time=event_model.date_time,
            capacity=event_model.capacity,
            price=event_model.price,
            status=event_model.status,
            created_at=event_model.created_at,
            total_tickets_sold=event_model.total_tickets_sold,
            total_revenue=event_model.total_revenue,
            total_bookings=event_model.total_bookings
        )
    
    async def get_all(self) -> List[Event]:
        """Get all events"""
        event_models = await EventModel.all()
        
        return [
            Event(
                id=event_model.id,
                title=event_model.title,
                description=event_model.description,
                venue=event_model.venue,
                date_time=event_model.date_time,
                capacity=event_model.capacity,
                price=event_model.price,
                status=event_model.status,
                created_at=event_model.created_at,
                total_tickets_sold=event_model.total_tickets_sold,
                total_revenue=event_model.total_revenue,
                total_bookings=event_model.total_bookings
            )
            for event_model in event_models
        ]
    
    async def get_by_status(self, status: EventStatus) -> List[Event]:
        """Get events by status"""
        event_models = await EventModel.filter(status=status).all()
        
        return [
            Event(
                id=event_model.id,
                title=event_model.title,
                description=event_model.description,
                venue=event_model.venue,
                date_time=event_model.date_time,
                capacity=event_model.capacity,
                price=event_model.price,
                status=event_model.status,
                created_at=event_model.created_at
            )
            for event_model in event_models
        ]
    
    async def update(self, event: Event) -> Event:
        """Update existing event"""
        event_model = await EventModel.get(id=event.id)
        event_model.title = event.title
        event_model.description = event.description
        event_model.venue = event.venue
        event_model.date_time = event.date_time
        event_model.capacity = event.capacity
        event_model.price = event.price
        event_model.status = event.status
        await event_model.save()
        
        return Event(
            id=event_model.id,
            title=event_model.title,
            description=event_model.description,
            venue=event_model.venue,
            date_time=event_model.date_time,
            capacity=event_model.capacity,
            price=event_model.price,
            status=event_model.status,
            created_at=event_model.created_at
        )
    
    async def delete(self, event_id: int) -> bool:
        """Delete event by ID"""
        event_model = await EventModel.get_or_none(id=event_id)
        if not event_model:
            return False
        
        await event_model.delete()
        return True
    
    async def get_active_events(self) -> List[Event]:
        """Get all active events"""
        return await self.get_by_status(EventStatus.ACTIVE)
    
    async def get_all_active(self) -> List[Event]:
        """Get all active events (alias for compatibility)"""
        return await self.get_active_events()
