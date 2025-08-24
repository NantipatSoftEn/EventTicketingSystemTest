from typing import List
from datetime import datetime
from ...domain.entities.booking import Booking, BookingStatus
from ...domain.repositories.booking_repository import BookingRepository
from ...domain.repositories.user_repository import UserRepository
from ...domain.repositories.event_repository import EventRepository
from ...domain.repositories.ticket_repository import TicketRepository
from ...domain.services.booking_service import BookingService
from ...domain.services.ticket_service import TicketService
from ..dtos.booking_dto import BookingCreateDTO, BookingResponseDTO, BookingWithDetailsDTO
from ..dtos.user_dto import UserResponseDTO
from ..dtos.event_dto import EventResponseDTO
from ..dtos.ticket_dto import TicketResponseDTO


class BookingUseCases:
    """Application use cases for booking operations"""
    
    def __init__(
        self,
        booking_repository: BookingRepository,
        user_repository: UserRepository,
        event_repository: EventRepository,
        ticket_repository: TicketRepository,
        booking_service: BookingService,
        ticket_service: TicketService
    ):
        self._booking_repository = booking_repository
        self._user_repository = user_repository
        self._event_repository = event_repository
        self._ticket_repository = ticket_repository
        self._booking_service = booking_service
        self._ticket_service = ticket_service
    
    async def create_booking(self, booking_dto: BookingCreateDTO) -> BookingResponseDTO:
        """Create a new booking with tickets"""
        # Validate user exists
        user = await self._user_repository.get_by_id(booking_dto.user_id)
        if not user:
            raise ValueError("User not found")
        
        # Validate event exists and get event details
        event = await self._event_repository.get_by_id(booking_dto.event_id)
        if not event:
            raise ValueError("Event not found")
        
        # Validate booking availability
        await self._booking_service.validate_booking_availability(
            booking_dto.event_id, booking_dto.quantity
        )
        
        # Calculate total amount
        total_amount = event.calculate_total_price(booking_dto.quantity)
        
        # Create booking domain entity
        booking = Booking(
            id=None,
            user_id=booking_dto.user_id,
            event_id=booking_dto.event_id,
            quantity=booking_dto.quantity,
            total_amount=total_amount,
            booking_date=datetime.now(),
            status=BookingStatus.CONFIRMED
        )
        
        # Save booking
        created_booking = await self._booking_repository.create(booking)
        
        # Generate tickets for the booking
        await self._ticket_service.generate_tickets_for_booking(
            created_booking.id, booking_dto.quantity
        )
        
        # Return DTO
        return BookingResponseDTO(
            id=created_booking.id,
            user_id=created_booking.user_id,
            event_id=created_booking.event_id,
            quantity=created_booking.quantity,
            total_amount=created_booking.total_amount,
            booking_date=created_booking.booking_date,
            status=created_booking.status
        )
    
    async def get_user_bookings(self, user_id: int) -> List[BookingWithDetailsDTO]:
        """Get bookings for a specific user with details"""
        # Validate user exists
        user = await self._user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        bookings = await self._booking_repository.get_by_user_id(user_id)
        
        result = []
        for booking in bookings:
            # Get related data
            booking_user = await self._user_repository.get_by_id(booking.user_id)
            booking_event = await self._event_repository.get_by_id(booking.event_id)
            booking_tickets = await self._ticket_repository.get_by_booking_id(booking.id)
            
            # Create DTOs
            user_dto = UserResponseDTO(
                id=booking_user.id,
                name=booking_user.name,
                phone=booking_user.phone,
                role=booking_user.role
            )
            
            event_dto = EventResponseDTO(
                id=booking_event.id,
                title=booking_event.title,
                description=booking_event.description,
                venue=booking_event.venue,
                date_time=booking_event.date_time,
                capacity=booking_event.capacity,
                price=booking_event.price,
                status=booking_event.status,
                created_at=booking_event.created_at
            )
            
            ticket_dtos = [
                TicketResponseDTO(
                    id=ticket.id,
                    booking_id=ticket.booking_id,
                    ticket_code=ticket.ticket_code,
                    status=ticket.status
                )
                for ticket in booking_tickets
            ]
            
            booking_dto = BookingWithDetailsDTO(
                id=booking.id,
                user_id=booking.user_id,
                event_id=booking.event_id,
                quantity=booking.quantity,
                total_amount=booking.total_amount,
                booking_date=booking.booking_date,
                status=booking.status,
                user=user_dto,
                event=event_dto,
                tickets=ticket_dtos
            )
            
            result.append(booking_dto)
        
        return result
    
    async def get_event_bookings(self, event_id: int) -> List[BookingWithDetailsDTO]:
        """Get bookings for a specific event with details (admin only)"""
        # Validate event exists
        event = await self._event_repository.get_by_id(event_id)
        if not event:
            raise ValueError("Event not found")
        
        bookings = await self._booking_repository.get_by_event_id(event_id)
        
        result = []
        for booking in bookings:
            # Get related data
            booking_user = await self._user_repository.get_by_id(booking.user_id)
            booking_event = await self._event_repository.get_by_id(booking.event_id)
            booking_tickets = await self._ticket_repository.get_by_booking_id(booking.id)
            
            # Create DTOs
            user_dto = UserResponseDTO(
                id=booking_user.id,
                name=booking_user.name,
                phone=booking_user.phone,
                role=booking_user.role
            )
            
            event_dto = EventResponseDTO(
                id=booking_event.id,
                title=booking_event.title,
                description=booking_event.description,
                venue=booking_event.venue,
                date_time=booking_event.date_time,
                capacity=booking_event.capacity,
                price=booking_event.price,
                status=booking_event.status,
                created_at=booking_event.created_at
            )
            
            ticket_dtos = [
                TicketResponseDTO(
                    id=ticket.id,
                    booking_id=ticket.booking_id,
                    ticket_code=ticket.ticket_code,
                    status=ticket.status
                )
                for ticket in booking_tickets
            ]
            
            booking_dto = BookingWithDetailsDTO(
                id=booking.id,
                user_id=booking.user_id,
                event_id=booking.event_id,
                quantity=booking.quantity,
                total_amount=booking.total_amount,
                booking_date=booking.booking_date,
                status=booking.status,
                user=user_dto,
                event=event_dto,
                tickets=ticket_dtos
            )
            
            result.append(booking_dto)
        
        return result
    
    async def update_booking_status(self, booking_id: int, status: BookingStatus) -> BookingResponseDTO:
        """Update booking status"""
        booking = await self._booking_repository.get_by_id(booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        # Update booking status
        if status == BookingStatus.CANCELLED:
            updated_booking = await self._booking_service.cancel_booking(booking_id)
            # Cancel associated tickets
            await self._ticket_service.cancel_tickets_for_booking(booking_id)
        else:
            booking.status = status
            updated_booking = await self._booking_repository.update(booking)
        
        return BookingResponseDTO(
            id=updated_booking.id,
            user_id=updated_booking.user_id,
            event_id=updated_booking.event_id,
            quantity=updated_booking.quantity,
            total_amount=updated_booking.total_amount,
            booking_date=updated_booking.booking_date,
            status=updated_booking.status
        )
