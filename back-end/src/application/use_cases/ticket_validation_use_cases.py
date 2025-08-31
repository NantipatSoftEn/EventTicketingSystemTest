"""
Ticket Validation Use Cases
Business logic for validating tickets and managing ticket status
"""

from typing import Optional
from datetime import datetime
from ...domain.repositories.ticket_repository import TicketRepository
from ...domain.repositories.booking_repository import BookingRepository
from ...domain.repositories.event_repository import EventRepository
from ...domain.repositories.user_repository import UserRepository
from ...domain.entities.ticket import TicketStatus
from ..dtos.ticket_dto import TicketValidationRequestDTO, TicketValidationResponseDTO


class TicketValidationUseCases:
    """Use cases for ticket validation operations"""
    
    def __init__(
        self, 
        ticket_repository: TicketRepository,
        booking_repository: BookingRepository,
        event_repository: EventRepository,
        user_repository: UserRepository
    ):
        self.ticket_repository = ticket_repository
        self.booking_repository = booking_repository
        self.event_repository = event_repository
        self.user_repository = user_repository
    
    async def validate_ticket(self, request: TicketValidationRequestDTO) -> TicketValidationResponseDTO:
        """Validate a ticket by its code and return detailed information"""
        
        # Check if ticket exists
        ticket = await self.ticket_repository.get_by_ticket_code(request.ticket_code)
        
        if not ticket:
            return TicketValidationResponseDTO(
                ticket_code=request.ticket_code,
                status=TicketStatus.CANCELLED,  # Default for non-existent tickets
                is_valid=False,
                message="Ticket not found"
            )
        
        # Get additional information about the ticket
        booking = await self.booking_repository.get_by_id(ticket.booking_id)
        event = None
        user = None
        
        if booking:
            event = await self.event_repository.get_by_id(booking.event_id)
            user = await self.user_repository.get_by_id(booking.user_id)
        
        # Determine validation status and message
        is_valid = False
        message = ""
        
        if ticket.status == TicketStatus.ACTIVE:
            is_valid = True
            message = "Ticket is valid and ready to use"
        elif ticket.status == TicketStatus.USED:
            is_valid = False
            message = "Ticket has already been used"
        elif ticket.status == TicketStatus.CANCELLED:
            is_valid = False
            message = "Ticket has been cancelled"
        
        # Check if event is still active (additional validation)
        if is_valid and event and hasattr(event, 'status'):
            if event.status != 'active':
                is_valid = False
                message = f"Event is {event.status}, ticket cannot be used"
        
        return TicketValidationResponseDTO(
            ticket_code=ticket.ticket_code,
            status=ticket.status,
            is_valid=is_valid,
            message=message,
            booking_id=ticket.booking_id,
            event_name=event.title if event else None,
            event_date=event.date_time if event else None,
            user_name=user.name if user else None
        )
    
    async def use_ticket(self, ticket_code: str) -> TicketValidationResponseDTO:
        """Mark a ticket as used if it's currently active"""
        
        # First validate the ticket
        validation_request = TicketValidationRequestDTO(ticket_code=ticket_code)
        validation_result = await self.validate_ticket(validation_request)
        
        if not validation_result.is_valid:
            return validation_result
        
        # Get the ticket entity
        ticket = await self.ticket_repository.get_by_ticket_code(ticket_code)
        
        if not ticket:
            return TicketValidationResponseDTO(
                ticket_code=ticket_code,
                status=TicketStatus.CANCELLED,
                is_valid=False,
                message="Ticket not found"
            )
        
        try:
            # Use the domain method to mark as used
            ticket.use()
            
            # Update in repository
            await self.ticket_repository.update(ticket)
            
            return TicketValidationResponseDTO(
                ticket_code=ticket.ticket_code,
                status=ticket.status,
                is_valid=False,  # No longer valid for future use
                message="Ticket has been successfully used",
                booking_id=validation_result.booking_id,
                event_name=validation_result.event_name,
                event_date=validation_result.event_date,
                user_name=validation_result.user_name
            )
            
        except ValueError as e:
            return TicketValidationResponseDTO(
                ticket_code=ticket_code,
                status=ticket.status,
                is_valid=False,
                message=str(e),
                booking_id=validation_result.booking_id,
                event_name=validation_result.event_name,
                event_date=validation_result.event_date,
                user_name=validation_result.user_name
            )
