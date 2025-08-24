import secrets
import string
from typing import List
from ..repositories.ticket_repository import TicketRepository
from ..entities.ticket import Ticket, TicketStatus


class TicketService:
    """Domain service for ticket-related business logic"""
    
    def __init__(self, ticket_repository: TicketRepository):
        self._ticket_repository = ticket_repository
    
    def generate_unique_ticket_code(self, length: int = 12) -> str:
        """Generate a unique secure ticket code"""
        characters = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    async def generate_tickets_for_booking(self, booking_id: int, quantity: int) -> List[Ticket]:
        """Generate multiple tickets for a booking"""
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        tickets = []
        for _ in range(quantity):
            # Generate unique ticket code
            ticket_code = self.generate_unique_ticket_code()
            
            # Ensure uniqueness
            while await self._ticket_repository.exists_by_ticket_code(ticket_code):
                ticket_code = self.generate_unique_ticket_code()
            
            ticket = Ticket(
                id=None,
                booking_id=booking_id,
                ticket_code=ticket_code,
                status=TicketStatus.ACTIVE
            )
            
            created_ticket = await self._ticket_repository.create(ticket)
            tickets.append(created_ticket)
        
        return tickets
    
    async def cancel_tickets_for_booking(self, booking_id: int) -> int:
        """Cancel all tickets for a booking"""
        return await self._ticket_repository.update_status_by_booking_id(
            booking_id, TicketStatus.CANCELLED
        )
    
    async def use_ticket(self, ticket_code: str) -> Ticket:
        """Mark a ticket as used"""
        ticket = await self._ticket_repository.get_by_ticket_code(ticket_code)
        if not ticket:
            raise ValueError("Ticket not found")
        
        ticket.use()
        return await self._ticket_repository.update(ticket)
