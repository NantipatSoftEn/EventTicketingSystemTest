from pydantic import BaseModel
from ...domain.entities.ticket import TicketStatus


class TicketResponseSchema(BaseModel):
    """Pydantic schema for ticket response"""
    id: int
    booking_id: int
    ticket_code: str
    status: TicketStatus
    
    class Config:
        from_attributes = True
