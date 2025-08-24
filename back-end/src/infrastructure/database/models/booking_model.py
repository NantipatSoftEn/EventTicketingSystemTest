from tortoise.models import Model
from tortoise import fields
from ....domain.entities.booking import BookingStatus


class BookingModel(Model):
    """Tortoise ORM model for Booking entity"""
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.UserModel", related_name="bookings")
    event = fields.ForeignKeyField("models.EventModel", related_name="bookings")
    quantity = fields.IntField()
    total_amount = fields.DecimalField(max_digits=10, decimal_places=2)
    booking_date = fields.DatetimeField(auto_now_add=True)
    status = fields.CharEnumField(BookingStatus, default=BookingStatus.CONFIRMED)
    
    class Meta:
        table = "bookings"
    
    def __str__(self):
        return f"Booking {self.id} - User {self.user_id} for Event {self.event_id}"
