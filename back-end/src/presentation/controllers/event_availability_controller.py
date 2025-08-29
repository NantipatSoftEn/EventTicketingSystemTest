"""
Event availability controller for handling availability requests
"""

from typing import Dict
from datetime import datetime
from fastapi import HTTPException, status
from ...application.use_cases.event_availability_use_cases import EventAvailabilityUseCases
from ..schemas.event_availability_schemas import EventAvailabilitySchema, MultipleEventAvailabilitySchema


class EventAvailabilityController:
    """Controller for event availability operations"""
    
    def __init__(self, event_availability_use_cases: EventAvailabilityUseCases):
        self._event_availability_use_cases = event_availability_use_cases
    
    async def get_event_availability(self, event_id: int) -> EventAvailabilitySchema:
        """Get real-time availability for a specific event"""
        try:
            availability_dto = await self._event_availability_use_cases.get_event_availability(event_id)
            
            # Set last updated timestamp
            availability_dto.last_updated = datetime.now()
            
            return EventAvailabilitySchema(
                event_id=availability_dto.event_id,
                total_capacity=availability_dto.total_capacity,
                booked_tickets=availability_dto.booked_tickets,
                available_tickets=availability_dto.available_tickets,
                occupancy_percentage=availability_dto.occupancy_percentage,
                is_sold_out=availability_dto.is_sold_out,
                is_almost_sold_out=availability_dto.is_almost_sold_out,
                event_status=availability_dto.event_status,
                last_updated=availability_dto.last_updated
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
    
    async def get_multiple_events_availability(self, event_ids: list[int]) -> MultipleEventAvailabilitySchema:
        """Get availability for multiple events"""
        try:
            availability_map = await self._event_availability_use_cases.get_multiple_events_availability(event_ids)
            
            # Convert DTOs to schemas
            events_availability = {}
            for event_id, availability_dto in availability_map.items():
                availability_dto.last_updated = datetime.now()
                events_availability[event_id] = EventAvailabilitySchema(
                    event_id=availability_dto.event_id,
                    total_capacity=availability_dto.total_capacity,
                    booked_tickets=availability_dto.booked_tickets,
                    available_tickets=availability_dto.available_tickets,
                    occupancy_percentage=availability_dto.occupancy_percentage,
                    is_sold_out=availability_dto.is_sold_out,
                    is_almost_sold_out=availability_dto.is_almost_sold_out,
                    event_status=availability_dto.event_status,
                    last_updated=availability_dto.last_updated
                )
            
            return MultipleEventAvailabilitySchema(
                events=events_availability,
                last_updated=datetime.now()
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching availability: {str(e)}"
            )
    
    async def get_all_active_events_availability(self) -> MultipleEventAvailabilitySchema:
        """Get availability for all active events"""
        try:
            availability_map = await self._event_availability_use_cases.get_all_active_events_availability()
            
            # Convert DTOs to schemas
            events_availability = {}
            for event_id, availability_dto in availability_map.items():
                availability_dto.last_updated = datetime.now()
                events_availability[event_id] = EventAvailabilitySchema(
                    event_id=availability_dto.event_id,
                    total_capacity=availability_dto.total_capacity,
                    booked_tickets=availability_dto.booked_tickets,
                    available_tickets=availability_dto.available_tickets,
                    occupancy_percentage=availability_dto.occupancy_percentage,
                    is_sold_out=availability_dto.is_sold_out,
                    is_almost_sold_out=availability_dto.is_almost_sold_out,
                    event_status=availability_dto.event_status,
                    last_updated=availability_dto.last_updated
                )
            
            return MultipleEventAvailabilitySchema(
                events=events_availability,
                last_updated=datetime.now()
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching all events availability: {str(e)}"
            )
