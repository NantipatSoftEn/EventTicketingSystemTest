from typing import List, Optional
from ...domain.entities.booking import Booking, BookingStatus
from ...domain.repositories.booking_repository import BookingRepository
from ..database.models.booking_model import BookingModel


class BookingRepositoryImpl(BookingRepository):
    """Tortoise ORM implementation of BookingRepository"""
    
    async def create(self, booking: Booking) -> Booking:
        """Create a new booking"""
        booking_model = await BookingModel.create(
            user_id=booking.user_id,
            event_id=booking.event_id,
            quantity=booking.quantity,
            total_amount=booking.total_amount,
            status=booking.status
        )
        
        return Booking(
            id=booking_model.id,
            user_id=booking_model.user_id,
            event_id=booking_model.event_id,
            quantity=booking_model.quantity,
            total_amount=booking_model.total_amount,
            booking_date=booking_model.booking_date,
            status=booking_model.status
        )
    
    async def get_by_id(self, booking_id: int) -> Optional[Booking]:
        """Get booking by ID"""
        booking_model = await BookingModel.get_or_none(id=booking_id)
        if not booking_model:
            return None
        
        return Booking(
            id=booking_model.id,
            user_id=booking_model.user_id,
            event_id=booking_model.event_id,
            quantity=booking_model.quantity,
            total_amount=booking_model.total_amount,
            booking_date=booking_model.booking_date,
            status=booking_model.status
        )
    
    async def get_all(self) -> List[Booking]:
        """Get all bookings"""
        booking_models = await BookingModel.all()
        
        return [
            Booking(
                id=booking_model.id,
                user_id=booking_model.user_id,
                event_id=booking_model.event_id,
                quantity=booking_model.quantity,
                total_amount=booking_model.total_amount,
                booking_date=booking_model.booking_date,
                status=booking_model.status
            )
            for booking_model in booking_models
        ]
    
    async def get_by_user_id(self, user_id: int) -> List[Booking]:
        """Get bookings by user ID"""
        booking_models = await BookingModel.filter(user_id=user_id).all()
        
        return [
            Booking(
                id=booking_model.id,
                user_id=booking_model.user_id,
                event_id=booking_model.event_id,
                quantity=booking_model.quantity,
                total_amount=booking_model.total_amount,
                booking_date=booking_model.booking_date,
                status=booking_model.status
            )
            for booking_model in booking_models
        ]
    
    async def get_by_event_id(self, event_id: int) -> List[Booking]:
        """Get bookings by event ID"""
        booking_models = await BookingModel.filter(event_id=event_id).all()
        
        return [
            Booking(
                id=booking_model.id,
                user_id=booking_model.user_id,
                event_id=booking_model.event_id,
                quantity=booking_model.quantity,
                total_amount=booking_model.total_amount,
                booking_date=booking_model.booking_date,
                status=booking_model.status
            )
            for booking_model in booking_models
        ]
    
    async def get_confirmed_bookings_for_event(self, event_id: int) -> List[Booking]:
        """Get confirmed bookings for an event"""
        booking_models = await BookingModel.filter(
            event_id=event_id, 
            status=BookingStatus.CONFIRMED
        ).all()
        
        return [
            Booking(
                id=booking_model.id,
                user_id=booking_model.user_id,
                event_id=booking_model.event_id,
                quantity=booking_model.quantity,
                total_amount=booking_model.total_amount,
                booking_date=booking_model.booking_date,
                status=booking_model.status
            )
            for booking_model in booking_models
        ]
    
    async def update(self, booking: Booking) -> Booking:
        """Update existing booking"""
        booking_model = await BookingModel.get(id=booking.id)
        booking_model.quantity = booking.quantity
        booking_model.total_amount = booking.total_amount
        booking_model.status = booking.status
        await booking_model.save()
        
        return Booking(
            id=booking_model.id,
            user_id=booking_model.user_id,
            event_id=booking_model.event_id,
            quantity=booking_model.quantity,
            total_amount=booking_model.total_amount,
            booking_date=booking_model.booking_date,
            status=booking_model.status
        )
    
    async def delete(self, booking_id: int) -> bool:
        """Delete booking by ID"""
        booking_model = await BookingModel.get_or_none(id=booking_id)
        if not booking_model:
            return False
        
        await booking_model.delete()
        return True
    
    async def get_total_booked_quantity_for_event(self, event_id: int) -> int:
        """Get total booked quantity for an event"""
        confirmed_bookings = await self.get_confirmed_bookings_for_event(event_id)
        return sum(booking.quantity for booking in confirmed_bookings)
