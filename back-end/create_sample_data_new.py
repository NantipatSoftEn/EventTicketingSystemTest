"""
Sample data creation script for Event Ticketing System
Creates sample users, events, bookings, and tickets for testing purposes
"""

import asyncio
from datetime import datetime, timedelta
from decimal import Decimal
from database import init_db, close_db
from models import User, Event, Booking, Ticket, UserRole, EventStatus, BookingStatus, TicketStatus
import secrets
import string


def generate_ticket_code() -> str:
    """Generate a unique secure ticket code"""
    length = 12
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


async def create_sample_data():
    """Create comprehensive sample data for the event ticketing system"""
    print("🚀 Starting sample data creation...")
    
    # Initialize database
    await init_db()
    
    # Clear existing data
    await Ticket.all().delete()
    await Booking.all().delete()
    await Event.all().delete()
    await User.all().delete()
    
    print("📝 Creating sample users...")
    
    # Create sample users
    users_data = [
        {
            "name": "John Doe",
            "phone": "0812345678",
            "role": UserRole.CUSTOMER
        },
        {
            "name": "Jane Smith", 
            "phone": "0823456789",
            "role": UserRole.CUSTOMER
        },
        {
            "name": "Admin User",
            "phone": "0801234567",
            "role": UserRole.ADMIN
        },
        {
            "name": "Bob Johnson",
            "phone": "0834567890",
            "role": UserRole.CUSTOMER
        },
        {
            "name": "Alice Brown",
            "phone": "0845678901",
            "role": UserRole.CUSTOMER
        }
    ]
    
    created_users = []
    for user_data in users_data:
        user = await User.create(**user_data)
        created_users.append(user)
        print(f"   ✅ Created user: {user.name} ({user.role})")
    
    print("\n🎫 Creating sample events...")
    
    # Create sample events
    base_date = datetime.now() + timedelta(days=30)
    events_data = [
        {
            "title": "Rock Concert 2025",
            "description": "An amazing rock concert featuring top bands from around the world. Experience the best live music performance of the year!",
            "venue": "Bangkok Arena",
            "date_time": base_date,
            "capacity": 5000,
            "price": Decimal("1500.00"),
            "status": EventStatus.ACTIVE
        },
        {
            "title": "Tech Conference Thailand",
            "description": "Join industry leaders and innovators for a comprehensive technology conference covering AI, blockchain, and digital transformation.",
            "venue": "BITEC Convention Center",
            "date_time": base_date + timedelta(days=15),
            "capacity": 2000,
            "price": Decimal("2500.00"),
            "status": EventStatus.ACTIVE
        },
        {
            "title": "Food Festival Bangkok",
            "description": "Discover amazing flavors from local and international cuisines. A paradise for food lovers with over 100 vendors.",
            "venue": "Lumpini Park",
            "date_time": base_date + timedelta(days=7),
            "capacity": 10000,
            "price": Decimal("500.00"),
            "status": EventStatus.ACTIVE
        },
        {
            "title": "Art Exhibition Modern",
            "description": "Contemporary art exhibition showcasing works from emerging and established artists across Southeast Asia.",
            "venue": "Bangkok Art Gallery",
            "date_time": base_date + timedelta(days=45),
            "capacity": 800,
            "price": Decimal("800.00"),
            "status": EventStatus.ACTIVE
        },
        {
            "title": "Sports Championship Final",
            "description": "The ultimate championship final featuring the best teams. Don't miss this thrilling sporting event!",
            "venue": "National Stadium",
            "date_time": base_date - timedelta(days=5),  # Past event
            "capacity": 50000,
            "price": Decimal("3000.00"),
            "status": EventStatus.COMPLETED
        }
    ]
    
    created_events = []
    for event_data in events_data:
        event = await Event.create(**event_data)
        created_events.append(event)
        print(f"   ✅ Created event: {event.title} at {event.venue}")
    
    print("\n📅 Creating sample bookings...")
    
    # Create sample bookings
    bookings_data = [
        {
            "user_id": created_users[0].id,  # John Doe
            "event_id": created_events[0].id,  # Rock Concert
            "quantity": 2
        },
        {
            "user_id": created_users[1].id,  # Jane Smith
            "event_id": created_events[1].id,  # Tech Conference
            "quantity": 1
        },
        {
            "user_id": created_users[3].id,  # Bob Johnson
            "event_id": created_events[0].id,  # Rock Concert
            "quantity": 4
        },
        {
            "user_id": created_users[4].id,  # Alice Brown
            "event_id": created_events[2].id,  # Food Festival
            "quantity": 3
        },
        {
            "user_id": created_users[0].id,  # John Doe
            "event_id": created_events[2].id,  # Food Festival
            "quantity": 2
        },
        {
            "user_id": created_users[1].id,  # Jane Smith
            "event_id": created_events[3].id,  # Art Exhibition
            "quantity": 1
        }
    ]
    
    created_bookings = []
    for booking_data in bookings_data:
        # Get event to calculate total amount
        event = await Event.get(id=booking_data["event_id"])
        total_amount = event.price * booking_data["quantity"]
        
        booking = await Booking.create(
            user_id=booking_data["user_id"],
            event_id=booking_data["event_id"],
            quantity=booking_data["quantity"],
            total_amount=total_amount,
            status=BookingStatus.CONFIRMED
        )
        created_bookings.append(booking)
        
        # Get user and event names for display
        user = await User.get(id=booking_data["user_id"])
        print(f"   ✅ Created booking: {user.name} -> {event.title} (Qty: {booking_data['quantity']})")
    
    print("\n🎟️ Creating sample tickets...")
    
    # Create tickets for each booking
    total_tickets_created = 0
    for booking in created_bookings:
        for i in range(booking.quantity):
            # Generate unique ticket code
            ticket_code = generate_ticket_code()
            while await Ticket.filter(ticket_code=ticket_code).exists():
                ticket_code = generate_ticket_code()
            
            await Ticket.create(
                booking_id=booking.id,
                ticket_code=ticket_code,
                status=TicketStatus.ACTIVE
            )
            total_tickets_created += 1
    
    print(f"   ✅ Created {total_tickets_created} tickets")
    
    # Create some cancelled bookings for testing
    print("\n❌ Creating cancelled booking examples...")
    
    cancelled_booking = await Booking.create(
        user_id=created_users[3].id,  # Bob Johnson
        event_id=created_events[1].id,  # Tech Conference
        quantity=2,
        total_amount=created_events[1].price * 2,
        status=BookingStatus.CANCELLED
    )
    
    # Create cancelled tickets
    for i in range(2):
        ticket_code = generate_ticket_code()
        while await Ticket.filter(ticket_code=ticket_code).exists():
            ticket_code = generate_ticket_code()
        
        await Ticket.create(
            booking_id=cancelled_booking.id,
            ticket_code=ticket_code,
            status=TicketStatus.CANCELLED
        )
    
    print(f"   ✅ Created cancelled booking example")
    
    # Print summary
    print("\n📊 Sample Data Summary:")
    print("========================")
    
    total_users = await User.all().count()
    total_events = await Event.all().count()
    total_bookings = await Booking.all().count()
    total_tickets = await Ticket.all().count()
    
    print(f"👥 Users: {total_users}")
    print(f"   - Customers: {await User.filter(role=UserRole.CUSTOMER).count()}")
    print(f"   - Admins: {await User.filter(role=UserRole.ADMIN).count()}")
    
    print(f"🎫 Events: {total_events}")
    print(f"   - Active: {await Event.filter(status=EventStatus.ACTIVE).count()}")
    print(f"   - Completed: {await Event.filter(status=EventStatus.COMPLETED).count()}")
    
    print(f"📅 Bookings: {total_bookings}")
    print(f"   - Confirmed: {await Booking.filter(status=BookingStatus.CONFIRMED).count()}")
    print(f"   - Cancelled: {await Booking.filter(status=BookingStatus.CANCELLED).count()}")
    
    print(f"🎟️ Tickets: {total_tickets}")
    print(f"   - Active: {await Ticket.filter(status=TicketStatus.ACTIVE).count()}")
    print(f"   - Cancelled: {await Ticket.filter(status=TicketStatus.CANCELLED).count()}")
    
    print("\n✨ Sample data creation completed successfully!")
    print("🚀 You can now start the API server with: fastapi dev main.py")
    
    # Close database connection
    await close_db()


if __name__ == "__main__":
    asyncio.run(create_sample_data())
