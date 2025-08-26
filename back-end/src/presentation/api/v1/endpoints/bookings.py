"""
Bookings API v1 endpoints
"""

from typing import List
from fastapi import APIRouter, HTTPException, status
from src.presentation.schemas.booking_schemas import (
    BookingCreateSchema, BookingResponseSchema, BookingWithDetailsSchema
)
from src.presentation.schemas.api_response_schemas import BookingApiResponse, BookingListApiResponse, ApiResponse, ApiListResponse
from src.presentation.utils.response_utils import prepare_response_data
from src.domain.entities.booking import BookingStatus
from src.container import container

router = APIRouter()


@router.post("", response_model=BookingApiResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(booking_data: BookingCreateSchema):
    """Create a new booking with automatic ticket generation"""
    booking = await container.booking_controller.create_booking(booking_data)
    return ApiResponse.success_response(
        data=prepare_response_data(booking),
        message="Booking created successfully"
    )


@router.get("/user/{user_id}", response_model=BookingListApiResponse)
async def get_user_bookings(user_id: int):
    """Get bookings for a specific user with full details"""
    bookings = await container.booking_controller.get_user_bookings(user_id)
    return ApiListResponse.success_response(
        data=prepare_response_data(bookings),
        message="User bookings retrieved successfully"
    )


@router.get("/event/{event_id}", response_model=BookingListApiResponse)
async def get_event_bookings(event_id: int, admin_user_id: int = 1):
    """Get bookings for a specific event with full details (admin only)"""
    bookings = await container.booking_controller.get_event_bookings(event_id, admin_user_id)
    return ApiListResponse.success_response(
        data=prepare_response_data(bookings),
        message="Event bookings retrieved successfully"
    )


@router.put("/{booking_id}/status", response_model=BookingApiResponse)
async def update_booking_status(booking_id: int, status: BookingStatus):
    """Update booking status (automatically handles ticket status updates)"""
    booking = await container.booking_controller.update_booking_status(booking_id, status)
    return ApiResponse.success_response(
        data=prepare_response_data(booking),
        message="Booking status updated successfully"
    )
