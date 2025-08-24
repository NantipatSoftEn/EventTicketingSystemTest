from tortoise.models import Model
from tortoise import fields
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


class EventStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class TicketStatus(str, Enum):
    ACTIVE = "active"
    USED = "used"
    CANCELLED = "cancelled"


class User(Model):
    """User model representing customers and admins"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    phone = fields.CharField(max_length=20, unique=True)
    role = fields.CharEnumField(UserRole, default=UserRole.CUSTOMER)
    
    # Relationships
    bookings: fields.ReverseRelation["Booking"]
    
    class Meta:
        table = "users"
    
    def __str__(self):
        return f"{self.name} ({self.role})"


class Event(Model):
    """Event model representing ticketed events"""
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200)
    description = fields.TextField()
    venue = fields.CharField(max_length=200)
    date_time = fields.DatetimeField()
    capacity = fields.IntField()
    price = fields.DecimalField(max_digits=10, decimal_places=2)
    status = fields.CharEnumField(EventStatus, default=EventStatus.ACTIVE)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    # Relationships
    bookings: fields.ReverseRelation["Booking"]
    
    class Meta:
        table = "events"
    
    def __str__(self):
        return f"{self.title} - {self.venue}"


class Booking(Model):
    """Booking model representing user bookings for events"""
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="bookings")
    event = fields.ForeignKeyField("models.Event", related_name="bookings")
    quantity = fields.IntField()
    total_amount = fields.DecimalField(max_digits=10, decimal_places=2)
    booking_date = fields.DatetimeField(auto_now_add=True)
    status = fields.CharEnumField(BookingStatus, default=BookingStatus.CONFIRMED)
    
    # Relationships
    tickets: fields.ReverseRelation["Ticket"]
    
    class Meta:
        table = "bookings"
    
    def __str__(self):
        return f"Booking {self.id} - {self.user.name} for {self.event.title}"


class Ticket(Model):
    """Ticket model representing individual tickets from bookings"""
    id = fields.IntField(pk=True)
    booking = fields.ForeignKeyField("models.Booking", related_name="tickets")
    ticket_code = fields.CharField(max_length=50, unique=True)
    status = fields.CharEnumField(TicketStatus, default=TicketStatus.ACTIVE)
    
    class Meta:
        table = "tickets"
    
    def __str__(self):
        return f"Ticket {self.ticket_code} - {self.status}"
