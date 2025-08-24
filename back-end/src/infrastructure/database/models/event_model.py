from tortoise.models import Model
from tortoise import fields
from ....domain.entities.event import EventStatus


class EventModel(Model):
    """Tortoise ORM model for Event entity"""
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200)
    description = fields.TextField()
    venue = fields.CharField(max_length=200)
    date_time = fields.DatetimeField()
    capacity = fields.IntField()
    price = fields.DecimalField(max_digits=10, decimal_places=2)
    status = fields.CharEnumField(EventStatus, default=EventStatus.ACTIVE)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta:
        table = "events"
    
    def __str__(self):
        return f"{self.title} - {self.venue}"
