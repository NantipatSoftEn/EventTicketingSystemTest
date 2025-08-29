from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.event import Event, EventStatus


class EventRepository(ABC):
    """Abstract repository interface for Event entity"""
    
    @abstractmethod
    async def create(self, event: Event) -> Event:
        """Create a new event"""
        pass
    
    @abstractmethod
    async def get_by_id(self, event_id: int) -> Optional[Event]:
        """Get event by ID"""
        pass
    
    @abstractmethod
    async def get_all(self) -> List[Event]:
        """Get all events"""
        pass
    
    @abstractmethod
    async def get_by_status(self, status: EventStatus) -> List[Event]:
        """Get events by status"""
        pass
    
    @abstractmethod
    async def update(self, event: Event) -> Event:
        """Update existing event"""
        pass
    
    @abstractmethod
    async def delete(self, event_id: int) -> bool:
        """Delete event by ID"""
        pass
    
    @abstractmethod
    async def get_active_events(self) -> List[Event]:
        """Get all active events"""
        pass
    
    @abstractmethod
    async def get_all_active(self) -> List[Event]:
        """Get all active events (alias for compatibility)"""
        pass
