import asyncio
import secrets
import string
from datetime import datetime, timedelta
from decimal import Decimal
from models import User, Event, Booking, Ticket, UserRole, EventStatus
from database import init_db, close_db


async def create_sample_data():
    """Create sample data for testing"""
    await init_db()
    
    try:
        # Create admin user
        admin = await User.create(
            name="Admin User",
            phone="+1234567890",
            role=UserRole.ADMIN
        )
        
        # Create customer users
        customer1 = await User.create(
            name="John Doe",
            phone="+1234567891",
            role=UserRole.CUSTOMER
        )
        
        customer2 = await User.create(
            name="Jane Smith",
            phone="+1234567892",
            role=UserRole.CUSTOMER
        )
        
        # Create events
        event1 = await Event.create(
            title="Rock Concert 2025",
            description="An amazing rock concert featuring local bands",
            venue="Madison Square Garden",
            date_time=datetime.now() + timedelta(days=30),
            capacity=1000,
            price=Decimal("75.00"),
            status=EventStatus.ACTIVE
        )
        
        event2 = await Event.create(
            title="Tech Conference 2025",
            description="Annual technology conference with industry leaders",
            venue="Convention Center",
            date_time=datetime.now() + timedelta(days=45),
            capacity=500,
            price=Decimal("199.99"),
            status=EventStatus.ACTIVE
        )
        
        # Create bookings
        booking1 = await Booking.create(
            user=customer1,
            event=event1,
            quantity=2,
            total_amount=Decimal("150.00")
        )
        
        booking2 = await Booking.create(
            user=customer2,
            event=event2,
            quantity=1,
            total_amount=Decimal("199.99")
        )
        
        # Create tickets with unique codes
        def generate_ticket_code():
            return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        
        for i in range(2):  # 2 tickets for booking1
            await Ticket.create(
                booking=booking1,
                ticket_code=f"RC2025-{generate_ticket_code()}"
            )
        
        for i in range(1):  # 1 ticket for booking2
            await Ticket.create(
                booking=booking2,
                ticket_code=f"TC2025-{generate_ticket_code()}"
            )
        
        print("Sample data created successfully!")
        print(f"Created {await User.all().count()} users")
        print(f"Created {await Event.all().count()} events")
        print(f"Created {await Booking.all().count()} bookings")
        print(f"Created {await Ticket.all().count()} tickets")
        
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(create_sample_data())
