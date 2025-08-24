from typing import List
from fastapi import HTTPException, status
from ...application.use_cases.event_use_cases import EventUseCases
from ...application.use_cases.user_use_cases import UserUseCases
from ...application.dtos.event_dto import EventCreateDTO, EventResponseDTO
from ..schemas.event_schemas import EventCreateSchema, EventResponseSchema


class EventController:
    """Controller for event-related endpoints"""
    
    def __init__(self, event_use_cases: EventUseCases, user_use_cases: UserUseCases):
        self._event_use_cases = event_use_cases
        self._user_use_cases = user_use_cases
    
    async def create_event(self, event_schema: EventCreateSchema, admin_user_id: int = 1) -> EventResponseSchema:
        """Create a new event (admin only)"""
        try:
            # Validate admin access
            await self._user_use_cases.validate_admin_access(admin_user_id)
            
            event_dto = EventCreateDTO(
                title=event_schema.title,
                description=event_schema.description,
                venue=event_schema.venue,
                date_time=event_schema.date_time,
                capacity=event_schema.capacity,
                price=event_schema.price,
                status=event_schema.status
            )
            
            created_event = await self._event_use_cases.create_event(event_dto)
            
            return EventResponseSchema(
                id=created_event.id,
                title=created_event.title,
                description=created_event.description,
                venue=created_event.venue,
                date_time=created_event.date_time,
                capacity=created_event.capacity,
                price=created_event.price,
                status=created_event.status,
                created_at=created_event.created_at
            )
        except ValueError as e:
            if "Admin access required" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=str(e)
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    async def get_event_by_id(self, event_id: int) -> EventResponseSchema:
        """Get event by ID"""
        try:
            event = await self._event_use_cases.get_event_by_id(event_id)
            
            return EventResponseSchema(
                id=event.id,
                title=event.title,
                description=event.description,
                venue=event.venue,
                date_time=event.date_time,
                capacity=event.capacity,
                price=event.price,
                status=event.status,
                created_at=event.created_at
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
    
    async def get_all_events(self) -> List[EventResponseSchema]:
        """Get all events"""
        events = await self._event_use_cases.get_all_events()
        
        return [
            EventResponseSchema(
                id=event.id,
                title=event.title,
                description=event.description,
                venue=event.venue,
                date_time=event.date_time,
                capacity=event.capacity,
                price=event.price,
                status=event.status,
                created_at=event.created_at
            )
            for event in events
        ]
    
    async def update_event(self, event_id: int, event_schema: EventCreateSchema, admin_user_id: int = 1) -> EventResponseSchema:
        """Update an existing event (admin only)"""
        try:
            # Validate admin access
            await self._user_use_cases.validate_admin_access(admin_user_id)
            
            event_dto = EventCreateDTO(
                title=event_schema.title,
                description=event_schema.description,
                venue=event_schema.venue,
                date_time=event_schema.date_time,
                capacity=event_schema.capacity,
                price=event_schema.price,
                status=event_schema.status
            )
            
            updated_event = await self._event_use_cases.update_event(event_id, event_dto)
            
            return EventResponseSchema(
                id=updated_event.id,
                title=updated_event.title,
                description=updated_event.description,
                venue=updated_event.venue,
                date_time=updated_event.date_time,
                capacity=updated_event.capacity,
                price=updated_event.price,
                status=updated_event.status,
                created_at=updated_event.created_at
            )
        except ValueError as e:
            if "Admin access required" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=str(e)
                )
            elif "not found" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=str(e)
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
