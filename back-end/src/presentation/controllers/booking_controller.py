from typing import List
from fastapi import HTTPException, status
from ...application.use_cases.booking_use_cases import BookingUseCases
from ...application.use_cases.user_use_cases import UserUseCases
from ...application.dtos.booking_dto import BookingCreateDTO, BookingResponseDTO, BookingWithDetailsDTO
from ...domain.entities.booking import BookingStatus
from ..schemas.booking_schemas import BookingCreateSchema, BookingResponseSchema, BookingWithDetailsSchema
from ..schemas.user_schemas import UserResponseSchema
from ..schemas.event_schemas import EventResponseSchema
from ..schemas.ticket_schemas import TicketResponseSchema


class BookingController:
    """Controller for booking-related endpoints"""
    
    def __init__(self, booking_use_cases: BookingUseCases, user_use_cases: UserUseCases):
        self._booking_use_cases = booking_use_cases
        self._user_use_cases = user_use_cases
    
    async def create_booking(self, booking_schema: BookingCreateSchema) -> BookingResponseSchema:
        """Create a new booking"""
        try:
            booking_dto = BookingCreateDTO(
                user_id=booking_schema.user_id,
                event_id=booking_schema.event_id,
                quantity=booking_schema.quantity
            )
            
            created_booking = await self._booking_use_cases.create_booking(booking_dto)
            
            return BookingResponseSchema(
                id=created_booking.id,
                user_id=created_booking.user_id,
                event_id=created_booking.event_id,
                quantity=created_booking.quantity,
                total_amount=created_booking.total_amount,
                booking_date=created_booking.booking_date,
                status=created_booking.status
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    async def get_user_bookings(self, user_id: int) -> List[BookingWithDetailsSchema]:
        """Get bookings for a specific user"""
        try:
            bookings = await self._booking_use_cases.get_user_bookings(user_id)
            
            return [
                BookingWithDetailsSchema(
                    id=booking.id,
                    user_id=booking.user_id,
                    event_id=booking.event_id,
                    quantity=booking.quantity,
                    total_amount=booking.total_amount,
                    booking_date=booking.booking_date,
                    status=booking.status,
                    user=UserResponseSchema(
                        id=booking.user.id,
                        name=booking.user.name,
                        phone=booking.user.phone,
                        role=booking.user.role
                    ),
                    event=EventResponseSchema(
                        id=booking.event.id,
                        title=booking.event.title,
                        description=booking.event.description,
                        venue=booking.event.venue,
                        date_time=booking.event.date_time,
                        capacity=booking.event.capacity,
                        price=booking.event.price,
                        status=booking.event.status,
                        created_at=booking.event.created_at
                    ),
                    tickets=[
                        TicketResponseSchema(
                            id=ticket.id,
                            booking_id=ticket.booking_id,
                            ticket_code=ticket.ticket_code,
                            status=ticket.status
                        )
                        for ticket in booking.tickets
                    ]
                )
                for booking in bookings
            ]
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
    
    async def get_event_bookings(self, event_id: int, admin_user_id: int = 1) -> List[BookingWithDetailsSchema]:
        """Get bookings for a specific event (admin only)"""
        try:
            # Validate admin access
            await self._user_use_cases.validate_admin_access(admin_user_id)
            
            bookings = await self._booking_use_cases.get_event_bookings(event_id)
            
            return [
                BookingWithDetailsSchema(
                    id=booking.id,
                    user_id=booking.user_id,
                    event_id=booking.event_id,
                    quantity=booking.quantity,
                    total_amount=booking.total_amount,
                    booking_date=booking.booking_date,
                    status=booking.status,
                    user=UserResponseSchema(
                        id=booking.user.id,
                        name=booking.user.name,
                        phone=booking.user.phone,
                        role=booking.user.role
                    ),
                    event=EventResponseSchema(
                        id=booking.event.id,
                        title=booking.event.title,
                        description=booking.event.description,
                        venue=booking.event.venue,
                        date_time=booking.event.date_time,
                        capacity=booking.event.capacity,
                        price=booking.event.price,
                        status=booking.event.status,
                        created_at=booking.event.created_at
                    ),
                    tickets=[
                        TicketResponseSchema(
                            id=ticket.id,
                            booking_id=ticket.booking_id,
                            ticket_code=ticket.ticket_code,
                            status=ticket.status
                        )
                        for ticket in booking.tickets
                    ]
                )
                for booking in bookings
            ]
        except ValueError as e:
            if "Admin access required" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=str(e)
                )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
    
    async def update_booking_status(self, booking_id: int, status: BookingStatus) -> BookingResponseSchema:
        """Update booking status"""
        try:
            updated_booking = await self._booking_use_cases.update_booking_status(booking_id, status)
            
            return BookingResponseSchema(
                id=updated_booking.id,
                user_id=updated_booking.user_id,
                event_id=updated_booking.event_id,
                quantity=updated_booking.quantity,
                total_amount=updated_booking.total_amount,
                booking_date=updated_booking.booking_date,
                status=updated_booking.status
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
