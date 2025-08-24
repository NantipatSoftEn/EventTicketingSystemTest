from tortoise.models import Model
from tortoise import fields
from ....domain.entities.ticket import TicketStatus


class TicketModel(Model):
    """Tortoise ORM model for Ticket entity"""
    id = fields.IntField(pk=True)
    booking = fields.ForeignKeyField("models.BookingModel", related_name="tickets")
    ticket_code = fields.CharField(max_length=50, unique=True)
    status = fields.CharEnumField(TicketStatus, default=TicketStatus.ACTIVE)
    
    class Meta:
        table = "tickets"
    
    def __str__(self):
        return f"Ticket {self.ticket_code} - {self.status}"
