"""
Ticket Validation API Endpoints
RESTful API endpoints for ticket validation operations
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

# Use cases
from src.application.use_cases.ticket_validation_use_cases import TicketValidationUseCases

# DTOs
from src.application.dtos.ticket_dto import TicketValidationRequestDTO, TicketValidationResponseDTO

# Presentation schemas
from src.presentation.schemas.ticket_validation_schemas import (
    TicketValidationRequest,
    TicketValidationResponse,
    TicketUseRequest
)
from src.presentation.schemas.api_response_schemas import ApiResponse

# Response utilities
from src.presentation.utils.response_utils import prepare_response_data

# Container for dependency injection
from src.container import Container

router = APIRouter()


def get_ticket_validation_use_cases() -> TicketValidationUseCases:
    """Dependency injection for TicketValidationUseCases"""
    container = Container()
    return container.ticket_validation_use_cases()


@router.post(
    "/validate",
    response_model=ApiResponse[TicketValidationResponse],
    status_code=status.HTTP_200_OK,
    summary="Validate a ticket by code",
    description="Validate a ticket using its unique code and get detailed status information"
)
async def validate_ticket(
    request: TicketValidationRequest,
    use_cases: TicketValidationUseCases = Depends(get_ticket_validation_use_cases)
) -> ApiResponse[TicketValidationResponse]:
    """Validate a ticket by its code"""
    
    try:
        # Convert to DTO
        dto_request = TicketValidationRequestDTO(ticket_code=request.ticket_code)
        
        # Execute use case
        result = await use_cases.validate_ticket(dto_request)
        
        # Convert result to response schema
        response_data = TicketValidationResponse(
            ticket_code=result.ticket_code,
            status=result.status.value,
            is_valid=result.is_valid,
            message=result.message,
            booking_id=result.booking_id,
            event_name=result.event_name,
            event_date=result.event_date,
            user_name=result.user_name
        )
        
        return ApiResponse(
            success=True,
            message="Ticket validation completed successfully",
            data=prepare_response_data(response_data)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating ticket: {str(e)}"
        )


@router.post(
    "/use",
    response_model=ApiResponse[TicketValidationResponse],
    status_code=status.HTTP_200_OK,
    summary="Use a ticket",
    description="Mark a ticket as used if it's currently valid"
)
async def use_ticket(
    request: TicketUseRequest,
    use_cases: TicketValidationUseCases = Depends(get_ticket_validation_use_cases)
) -> ApiResponse[TicketValidationResponse]:
    """Mark a ticket as used"""
    
    try:
        # Execute use case
        result = await use_cases.use_ticket(request.ticket_code)
        
        # Convert result to response schema
        response_data = TicketValidationResponse(
            ticket_code=result.ticket_code,
            status=result.status.value,
            is_valid=result.is_valid,
            message=result.message,
            booking_id=result.booking_id,
            event_name=result.event_name,
            event_date=result.event_date,
            user_name=result.user_name
        )
        
        return ApiResponse(
            success=True,
            message="Ticket operation completed successfully",
            data=prepare_response_data(response_data)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error using ticket: {str(e)}"
        )
