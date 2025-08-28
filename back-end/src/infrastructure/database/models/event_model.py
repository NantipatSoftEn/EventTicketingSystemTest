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
    
    # Computed fields for performance (updated by triggers)
    total_tickets_sold = fields.IntField(default=0)
    total_revenue = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_bookings = fields.IntField(default=0)
    
    class Meta:
        table = "events"
    
    def __str__(self):
        return f"{self.title} - {self.venue}"

    @property
    def available_tickets(self) -> int:
        """Calculate available tickets"""
        return self.capacity - self.total_tickets_sold
    
    @property
    def occupancy_percentage(self) -> float:
        """Calculate occupancy percentage"""
        if self.capacity == 0:
            return 0.0
        return round((self.total_tickets_sold * 100.0) / self.capacity, 2)
    
    @property
    def potential_revenue(self) -> float:
        """Calculate potential revenue if all tickets are sold"""
        return float(self.capacity * self.price)
