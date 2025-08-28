"""
Events API v1 endpoints
"""

from typing import List
from fastapi import APIRouter, HTTPException, status
from src.presentation.schemas.event_schemas import EventCreateSchema, EventResponseSchema, EventManagementSchema, EventPatchSchema
from src.presentation.schemas.api_response_schemas import EventApiResponse, EventListApiResponse, EventManagementApiResponse, ApiResponse, ApiListResponse
from src.presentation.utils.response_utils import prepare_response_data
from src.container import container

router = APIRouter()


@router.post("", response_model=EventApiResponse, status_code=status.HTTP_201_CREATED)
async def create_event(event_data: EventCreateSchema, admin_user_id: int = 1):
    """Create a new event (admin only)"""
    event = await container.event_controller.create_event(event_data, admin_user_id)
    return ApiResponse.success_response(
        data=prepare_response_data(event),
        message="Event created successfully"
    )


@router.get("", response_model=EventListApiResponse)
async def list_events():
    """Get all events"""
    events = await container.event_controller.get_all_events()
    return ApiListResponse.success_response(
        data=prepare_response_data(events),
        message="Events retrieved successfully"
    )


@router.get("/{event_id}", response_model=EventApiResponse)
async def get_event(event_id: int):
    """Get event by ID"""
    event = await container.event_controller.get_event_by_id(event_id)
    return ApiResponse.success_response(
        data=prepare_response_data(event),
        message="Event retrieved successfully"
    )


@router.put("/{event_id}", response_model=EventApiResponse)
async def update_event(event_id: int, event_data: EventCreateSchema, admin_user_id: int = 1):
    """Update event by ID (admin only)"""
    event = await container.event_controller.update_event(event_id, event_data, admin_user_id)
    return ApiResponse.success_response(
        data=prepare_response_data(event),
        message="Event updated successfully"
    )


@router.patch("/{event_id}", response_model=EventApiResponse)
async def patch_event(event_id: int, event_data: EventPatchSchema, admin_user_id: int = 1):
    """Partially update event by ID (admin only)"""
    event = await container.event_controller.patch_event(event_id, event_data, admin_user_id)
    return ApiResponse.success_response(
        data=prepare_response_data(event),
        message="Event partially updated successfully"
    )


@router.delete("/{event_id}")
async def delete_event(event_id: int, admin_user_id: int = 1):
    """Delete event by ID (admin only)"""
    result = await container.event_controller.delete_event(event_id, admin_user_id)
    return ApiResponse.success_response(
        data=None,
        message=result["message"]
    )


@router.get("/management/view", response_model=EventManagementApiResponse)
async def get_events_for_management():
    """Get all events with statistics for management table view"""
    events = await container.event_controller.get_events_for_management()
    return ApiListResponse.success_response(
        data=prepare_response_data(events),
        message="Events management data retrieved successfully"
    )
