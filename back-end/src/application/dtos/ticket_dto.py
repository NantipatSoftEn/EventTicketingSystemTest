from dataclasses import dataclass
from ...domain.entities.ticket import TicketStatus


@dataclass
class TicketResponseDTO:
    """DTO for ticket response"""
    id: int
    booking_id: int
    ticket_code: str
    status: TicketStatus
