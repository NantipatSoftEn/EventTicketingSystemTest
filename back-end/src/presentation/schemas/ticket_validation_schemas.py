"""
Ticket Validation API Schemas
Pydantic models for request/response validation for ticket validation endpoints
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class TicketValidationRequest(BaseModel):
    """Request schema for ticket validation"""
    ticket_code: str = Field(..., min_length=8, max_length=100, description="Unique ticket code")
    
    @validator('ticket_code')
    def validate_ticket_code(cls, v):
        if not v or not v.strip():
            raise ValueError('Ticket code cannot be empty')
        return v.strip()


class TicketUseRequest(BaseModel):
    """Request schema for using a ticket"""
    ticket_code: str = Field(..., min_length=8, max_length=100, description="Unique ticket code")
    
    @validator('ticket_code')
    def validate_ticket_code(cls, v):
        if not v or not v.strip():
            raise ValueError('Ticket code cannot be empty')
        return v.strip()


class TicketValidationResponse(BaseModel):
    """Response schema for ticket validation"""
    ticket_code: str = Field(..., description="Unique ticket code")
    status: str = Field(..., description="Current ticket status (active, used, cancelled)")
    is_valid: bool = Field(..., description="Whether the ticket is valid for use")
    message: str = Field(..., description="Validation message")
    booking_id: Optional[int] = Field(None, description="Associated booking ID")
    event_name: Optional[str] = Field(None, description="Event name")
    event_date: Optional[datetime] = Field(None, description="Event date and time")
    user_name: Optional[str] = Field(None, description="Ticket holder name")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
        schema_extra = {
            "example": {
                "ticket_code": "TKT-20250901-ABC12345",
                "status": "active",
                "is_valid": True,
                "message": "Ticket is valid and ready to use",
                "booking_id": 1,
                "event_name": "Music Concert 2025",
                "event_date": "2025-12-31T20:00:00",
                "user_name": "John Doe"
            }
        }
