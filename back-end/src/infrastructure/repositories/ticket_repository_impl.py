from typing import List, Optional
from ...domain.entities.ticket import Ticket, TicketStatus
from ...domain.repositories.ticket_repository import TicketRepository
from ..database.models.ticket_model import TicketModel


class TicketRepositoryImpl(TicketRepository):
    """Tortoise ORM implementation of TicketRepository"""
    
    async def create(self, ticket: Ticket) -> Ticket:
        """Create a new ticket"""
        ticket_model = await TicketModel.create(
            booking_id=ticket.booking_id,
            ticket_code=ticket.ticket_code,
            status=ticket.status
        )
        
        return Ticket(
            id=ticket_model.id,
            booking_id=ticket_model.booking_id,
            ticket_code=ticket_model.ticket_code,
            status=ticket_model.status
        )
    
    async def get_by_id(self, ticket_id: int) -> Optional[Ticket]:
        """Get ticket by ID"""
        ticket_model = await TicketModel.get_or_none(id=ticket_id)
        if not ticket_model:
            return None
        
        return Ticket(
            id=ticket_model.id,
            booking_id=ticket_model.booking_id,
            ticket_code=ticket_model.ticket_code,
            status=ticket_model.status
        )
    
    async def get_by_ticket_code(self, ticket_code: str) -> Optional[Ticket]:
        """Get ticket by ticket code"""
        ticket_model = await TicketModel.get_or_none(ticket_code=ticket_code)
        if not ticket_model:
            return None
        
        return Ticket(
            id=ticket_model.id,
            booking_id=ticket_model.booking_id,
            ticket_code=ticket_model.ticket_code,
            status=ticket_model.status
        )
    
    async def get_all(self) -> List[Ticket]:
        """Get all tickets"""
        ticket_models = await TicketModel.all()
        
        return [
            Ticket(
                id=ticket_model.id,
                booking_id=ticket_model.booking_id,
                ticket_code=ticket_model.ticket_code,
                status=ticket_model.status
            )
            for ticket_model in ticket_models
        ]
    
    async def get_by_booking_id(self, booking_id: int) -> List[Ticket]:
        """Get tickets by booking ID"""
        ticket_models = await TicketModel.filter(booking_id=booking_id).all()
        
        return [
            Ticket(
                id=ticket_model.id,
                booking_id=ticket_model.booking_id,
                ticket_code=ticket_model.ticket_code,
                status=ticket_model.status
            )
            for ticket_model in ticket_models
        ]
    
    async def update(self, ticket: Ticket) -> Ticket:
        """Update existing ticket"""
        ticket_model = await TicketModel.get(id=ticket.id)
        ticket_model.ticket_code = ticket.ticket_code
        ticket_model.status = ticket.status
        await ticket_model.save()
        
        return Ticket(
            id=ticket_model.id,
            booking_id=ticket_model.booking_id,
            ticket_code=ticket_model.ticket_code,
            status=ticket_model.status
        )
    
    async def delete(self, ticket_id: int) -> bool:
        """Delete ticket by ID"""
        ticket_model = await TicketModel.get_or_none(id=ticket_id)
        if not ticket_model:
            return False
        
        await ticket_model.delete()
        return True
    
    async def exists_by_ticket_code(self, ticket_code: str) -> bool:
        """Check if ticket exists by ticket code"""
        return await TicketModel.filter(ticket_code=ticket_code).exists()
    
    async def update_status_by_booking_id(self, booking_id: int, status: TicketStatus) -> int:
        """Update ticket status for all tickets in a booking"""
        updated_count = await TicketModel.filter(booking_id=booking_id).update(status=status)
        return updated_count
