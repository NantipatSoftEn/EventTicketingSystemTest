"""
Event availability API endpoints
"""

from typing import List
from fastapi import APIRouter, Query
from src.presentation.schemas.event_availability_schemas import EventAvailabilitySchema, MultipleEventAvailabilitySchema
from src.presentation.schemas.api_response_schemas import ApiResponse
from src.container import container

router = APIRouter()


@router.get("/{event_id}", response_model=ApiResponse[EventAvailabilitySchema])
async def get_event_availability(event_id: int):
    """Get real-time availability for a specific event"""
    availability = await container.event_availability_controller.get_event_availability(event_id)
    return ApiResponse.success_response(
        data=availability,
        message="Event availability retrieved successfully"
    )


@router.get("", response_model=ApiResponse[MultipleEventAvailabilitySchema])
async def get_multiple_events_availability(
    event_ids: List[int] = Query(..., description="List of event IDs to get availability for")
):
    """Get availability for multiple events in one request"""
    availability = await container.event_availability_controller.get_multiple_events_availability(event_ids)
    return ApiResponse.success_response(
        data=availability,
        message="Multiple events availability retrieved successfully"
    )


@router.get("/all/active", response_model=ApiResponse[MultipleEventAvailabilitySchema])
async def get_all_active_events_availability():
    """Get availability for all active events"""
    availability = await container.event_availability_controller.get_all_active_events_availability()
    return ApiResponse.success_response(
        data=availability,
        message="All active events availability retrieved successfully"
    )
