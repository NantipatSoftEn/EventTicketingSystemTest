# Event Ticketing System - Backend API

A comprehensive event ticketing system backend built with FastAPI, featuring user management, event creation, booking system, and ticket generation with clean architecture principles.

## 🚀 Features

- **User Management**: Customer and admin role-based access
- **Event Management**: Create, update, and manage events with capacity controls
- **Booking System**: Ticket availability validation and booking management
- **Ticket Generation**: Secure unique ticket code generation
- **Data Validation**: Comprehensive input validation and sanitization
- **Database Integration**: PostgreSQL support with migrations
- **Clean Architecture**: Separation of concerns with proper schemas and models

## 📋 Requirements

- Python 3.9+
- FastAPI
- Tortoise ORM
- SQLite (default) or PostgreSQL
- Pydantic for data validation

## 🛠️ Installation & Setup

### 1. Clone and Navigate
```bash
cd back-end
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```env
DATABASE_URL=sqlite://./event_ticketing.db
# For PostgreSQL: postgresql://user:password@localhost:5432/event_ticketing
```

### 4. Create Sample Data
```bash
python create_sample_data.py
```

### 5. Start the Server
```bash
fastapi dev main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication Note
This implementation includes admin role validation but doesn't include full authentication middleware. In production, implement proper JWT/OAuth authentication.

## 🎫 Events API

### List All Events
```http
GET /api/events
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Rock Concert 2025",
    "description": "An amazing rock concert...",
    "venue": "Bangkok Arena",
    "date_time": "2025-09-24T12:00:00",
    "capacity": 5000,
    "price": "1500.00",
    "status": "active",
    "created_at": "2025-08-25T12:00:00"
  }
]
```

### Get Event Details
```http
GET /api/events/{id}
```

### Create Event (Admin Only)
```http
POST /api/events
```

**Request Body:**
```json
{
  "title": "New Event",
  "description": "Event description",
  "venue": "Event Venue",
  "date_time": "2025-12-25T19:00:00",
  "capacity": 1000,
  "price": "2000.00",
  "status": "active"
}
```

### Update Event
```http
PUT /api/events/{id}
```

## 📅 Bookings API

### Create Booking
```http
POST /api/bookings
```

**Request Body:**
```json
{
  "user_id": 1,
  "event_id": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "event_id": 1,
  "quantity": 2,
  "total_amount": "3000.00",
  "booking_date": "2025-08-25T12:00:00",
  "status": "confirmed"
}
```

### Get User Bookings
```http
GET /api/bookings/user/{user_id}
```

**Response includes:**
- Booking details
- User information
- Event information
- Associated tickets

### Get Event Bookings (Admin Only)
```http
GET /api/bookings/event/{event_id}
```

### Update Booking Status
```http
PUT /api/bookings/{booking_id}?status=cancelled
```

## 👥 Users API

### List All Users
```http
GET /api/users
```

### Create User
```http
POST /api/users
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "0812345678",
  "role": "customer"
}
```

## 🏗️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer'
);
```

### Events Table
```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    venue VARCHAR(200) NOT NULL,
    date_time DATETIME NOT NULL,
    capacity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed'
);
```

### Tickets Table
```sql
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('active', 'used', 'cancelled') DEFAULT 'active'
);
```

## 🔧 Business Logic Features

### Ticket Availability Validation
- Automatically checks available capacity before booking
- Prevents overbooking
- Returns clear error messages for insufficient tickets

### Secure Ticket Code Generation
- 12-character alphanumeric codes
- Cryptographically secure random generation
- Uniqueness validation

### Data Validation
- Comprehensive input validation using Pydantic
- Phone number uniqueness enforcement
- Positive quantity and price validation
- Date validation for events

### Booking Management
- Automatic total amount calculation
- Ticket generation upon booking confirmation
- Cascade status updates (cancelled bookings → cancelled tickets)

## 📊 Sample Data

The system includes comprehensive sample data:
- **5 Users**: 4 customers + 1 admin
- **5 Events**: Various event types with different capacities and prices
- **7 Bookings**: Mix of confirmed and cancelled bookings
- **15 Tickets**: Associated with bookings

## 🔍 Testing the API

### Using curl

**Create a booking:**
```bash
curl -X POST "http://localhost:8000/api/bookings" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": 1,
       "event_id": 1,
       "quantity": 2
     }'
```

**Get events:**
```bash
curl -X GET "http://localhost:8000/api/events"
```

### Using the Interactive Docs
Visit `http://localhost:8000/docs` for a complete interactive API documentation where you can test all endpoints directly.

## 🚀 Production Considerations

### Security
- Implement proper authentication middleware
- Add rate limiting
- Use environment variables for sensitive data
- Enable CORS properly for frontend integration

### Database
- Use PostgreSQL for production
- Implement database migrations with Aerich
- Add database connection pooling
- Set up proper indexes for performance

### Performance
- Add caching for frequently accessed data
- Implement pagination for list endpoints
- Add database query optimization
- Monitor and log API performance

### Error Handling
- Implement comprehensive error handling
- Add structured logging
- Set up error monitoring
- Add input sanitization

## 📁 Project Structure

```
back-end/
├── main.py                 # FastAPI application and API routes
├── models/                 # Database models and enums
│   └── __init__.py
├── schemas.py              # Pydantic schemas for validation
├── database.py             # Database configuration
├── create_sample_data.py   # Sample data generation script
├── requirements.txt        # Python dependencies
├── pyproject.toml         # Project configuration
└── README.md              # This file
```

## 🤝 API Design Decisions

1. **RESTful Design**: Following REST principles for intuitive API structure
2. **Status Enums**: Using enums for status fields to ensure data consistency
3. **Relationship Handling**: Proper foreign key relationships with cascading
4. **Validation**: Comprehensive input validation at the schema level
5. **Error Responses**: Consistent HTTP status codes and error messages
6. **Response Models**: Structured response schemas for consistent API responses

## 🔧 Development Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Create sample data
python create_sample_data.py

# Start development server
fastapi dev main.py

# Start production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

**Ready to use!** The backend API is now fully functional with all the requirements from the README implemented, including comprehensive business logic, data validation, and sample data for testing.
