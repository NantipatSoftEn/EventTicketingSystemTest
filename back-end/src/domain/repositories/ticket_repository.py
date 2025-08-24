from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.ticket import Ticket, TicketStatus


class TicketRepository(ABC):
    """Abstract repository interface for Ticket entity"""
    
    @abstractmethod
    async def create(self, ticket: Ticket) -> Ticket:
        """Create a new ticket"""
        pass
    
    @abstractmethod
    async def get_by_id(self, ticket_id: int) -> Optional[Ticket]:
        """Get ticket by ID"""
        pass
    
    @abstractmethod
    async def get_by_ticket_code(self, ticket_code: str) -> Optional[Ticket]:
        """Get ticket by ticket code"""
        pass
    
    @abstractmethod
    async def get_all(self) -> List[Ticket]:
        """Get all tickets"""
        pass
    
    @abstractmethod
    async def get_by_booking_id(self, booking_id: int) -> List[Ticket]:
        """Get tickets by booking ID"""
        pass
    
    @abstractmethod
    async def update(self, ticket: Ticket) -> Ticket:
        """Update existing ticket"""
        pass
    
    @abstractmethod
    async def delete(self, ticket_id: int) -> bool:
        """Delete ticket by ID"""
        pass
    
    @abstractmethod
    async def exists_by_ticket_code(self, ticket_code: str) -> bool:
        """Check if ticket exists by ticket code"""
        pass
    
    @abstractmethod
    async def update_status_by_booking_id(self, booking_id: int, status: TicketStatus) -> int:
        """Update ticket status for all tickets in a booking"""
        pass
