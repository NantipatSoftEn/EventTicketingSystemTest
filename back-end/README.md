# Event Ticketing System - Backend API

A comprehensive event ticketing system backend built with ***FastAPI***, featuring user management, event creation, booking system, and ticket generation with clean architecture principles.

## 📑 Table of Contents

- [📚 Documentation](#-documentation)
- [🚀 Features](#-features)
- [📋 Requirements](#-requirements)
- [🛠️ Installation & Setup](#️-installation--setup)
- [📚 API Documentation](#-api-documentation)
- [🎫 Events API](#-events-api)
- [📅 Bookings API](#-bookings-api)
- [👥 Users API](#-users-api)
- [📋 Complete API Reference](#-complete-api-reference)
- [🏗️ Database Schema](#️-database-schema)
- [🔧 Business Logic Features](#-business-logic-features)
- [📊 Sample Data](#-sample-data)
- [🔍 Testing the API](#-testing-the-api)
- [🔄 Migration Guide](#-migration-guide)
- [🚀 Production Considerations](#-production-considerations)
- [📁 Project Structure](#-project-structure)
- [🤝 API Design Decisions](#-api-design-decisions)
- [🔧 Development Commands](#-development-commands)
- [🗄️ Database Management](#️-database-management)

## 📚 Documentation

### Core Documentation
- **[Database Management Guide](docs/DATABASE_README.md)** - Complete database schema, migrations, and management documentation
- **[API Versioning Guide](docs/API_VERSIONING_GUIDE.md)** - API versioning strategy, migration guide, and response format details
- **[System Diagrams](docs/SYSTEM_DIAGRAMS.md)** - Entity relationship diagrams, API flow charts, and system architecture diagrams

## 🚀 Features

- **Clean Architecture**: Proper separation of concerns with domain, application, infrastructure, and presentation layers
- **User Management**: Customer and admin role-based access
- **Event Management**: Create, update, and manage events with capacity controls and computed statistics
- **Booking System**: Ticket availability validation and booking management with real-time capacity tracking
- **Ticket Generation**: Secure unique ticket code generation with automatic assignment
- **Data Validation**: Comprehensive input validation and sanitization with Pydantic v2
- **Database Integration**: PostgreSQL support with migrations and Docker setup
- **API Versioning**: URL-based versioning with structured response formats
- **Performance Optimization**: Computed fields for real-time statistics without N+1 queries

## 📋 Requirements

- Python 3.9+
- FastAPI 0.104.1+
- Tortoise ORM 0.20.0+
- PostgreSQL 15+ (with Docker support)
- Pydantic v2 for data validation
- Docker & Docker Compose

## 🛠️ Installation & Setup

### 1. Clone and Navigate
```bash
cd back-end
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup with Docker
Start PostgreSQL database:
```bash
docker-compose up -d
```

### 4. Apply Database Migrations
```bash
./run_migrations.sh up
```

### 5. Create Sample Data
```bash
python create_sample_data.py
```

### 6. Start the Development Server
```bash
# Using FastAPI development server
fastapi dev src/main.py

# Or using uvicorn directly
uvicorn src.main:app --reload
```

The API will be available at:
- **API**: <http://localhost:8000>
- **Interactive Docs**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>

## 📚 API Documentation

### Documentation Links

- **[Database Management Guide](docs/DATABASE_README.md)** - Complete database schema, migrations, and management documentation
- **[API Versioning Guide](docs/API_VERSIONING_GUIDE.md)** - API versioning strategy, migration guide, and response format details
- **[System Diagrams](docs/SYSTEM_DIAGRAMS.md)** - Entity relationship diagrams, API flow charts, and system architecture diagrams

### Base URL

```text
http://localhost:8000/api/v1
```

### API Versioning
This API uses URL-based versioning strategy for backward compatibility and scalability:

- **Current Version**: v1 (stable)
- **URL Pattern**: `/api/v1/`
- **Version Discovery**: `GET /api` - Returns available versions and documentation links
- **Future Versions**: v2 planned with enhanced features

### Standardized Response Format
All API endpoints return a consistent response structure:

```json
{
  "success": boolean,
  "message": "Descriptive message",
  "data": {} | [] | null
}
```

### Version Discovery
```http
GET /api
```

**Response:**
```json
{
  "success": true,
  "message": "API version information retrieved successfully",
  "data": {
    "available_versions": ["v1"],
    "default_version": "v1",
    "current_version_url": "/api/v1",
    "documentation": {
      "v1": "/docs"
    }
  }
}
```

### Authentication Note
This implementation includes admin role validation but doesn't include full authentication middleware. In production, implement proper JWT/OAuth authentication.

## 🎫 Events API

### List All Events
```http
GET /api/v1/events
```

**Response:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
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
}
```

### Get Event Details
```http
GET /api/v1/events/{id}
```

### Create Event (Admin Only)
```http
POST /api/v1/events
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
PUT /api/v1/events/{id}
```

### Delete Event (Admin Only)
```http
DELETE /api/v1/events/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "data": null
}
```

## 📅 Bookings API

### Create Booking
```http
POST /api/v1/bookings
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
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "event_id": 1,
    "quantity": 2,
    "total_amount": "3000.00",
    "booking_date": "2025-08-25T12:00:00",
    "status": "confirmed"
  }
}
```

### Get User Bookings
```http
GET /api/v1/bookings/user/{user_id}
```

**Response includes:**
- Booking details
- User information
- Event information
- Associated tickets

### Get Event Bookings (Admin Only)
```http
GET /api/v1/bookings/event/{event_id}
```

### Update Booking Status
```http
PUT /api/v1/bookings/{booking_id}/status
```

## 👥 Users API

### List All Users
```http
GET /api/v1/users
```

### Create User
```http
POST /api/v1/users
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "0812345678",
  "role": "customer"
}
```

## 📋 Complete API Reference

### API Endpoints Summary

#### Events Management
| Method | Endpoint | Description | Admin Required |
|--------|----------|-------------|----------------|
| `POST` | `/api/v1/events` | Create a new event | ✅ |
| `GET` | `/api/v1/events` | Get all events | ❌ |
| `GET` | `/api/v1/events/{event_id}` | Get event by ID | ❌ |
| `PUT` | `/api/v1/events/{event_id}` | Update event completely | ✅ |
| `PATCH` | `/api/v1/events/{event_id}` | Partially update event | ✅ |
| `DELETE` | `/api/v1/events/{event_id}` | Delete event | ✅ |
| `GET` | `/api/v1/events/management/view` | Get events with management statistics | ✅ |

#### User Management
| Method | Endpoint | Description | Admin Required |
|--------|----------|-------------|----------------|
| `POST` | `/api/v1/users` | Create a new user | ❌ |
| `GET` | `/api/v1/users` | Get all users | ❌ |
| `GET` | `/api/v1/users/{user_id}` | Get user by ID | ❌ |

#### Booking Management
| Method | Endpoint | Description | Admin Required |
|--------|----------|-------------|----------------|
| `POST` | `/api/v1/bookings` | Create new booking with automatic ticket generation | ❌ |
| `GET` | `/api/v1/bookings/{booking_id}` | Get booking by ID with full details | ❌ |
| `GET` | `/api/v1/bookings/user/{user_id}` | Get all bookings for specific user | ❌ |
| `GET` | `/api/v1/bookings/event/{event_id}` | Get all bookings for specific event | ✅ |
| `GET` | `/api/v1/bookings/event/{event_id}/stats` | Get booking statistics for event | ❌ |
| `PUT` | `/api/v1/bookings/{booking_id}/status` | Update booking status | ❌ |

#### Event Availability
| Method | Endpoint | Description | Admin Required |
|--------|----------|-------------|----------------|
| `GET` | `/api/v1/event-availability/{event_id}` | Get real-time availability for specific event | ❌ |
| `GET` | `/api/v1/event-availability?event_ids=[]` | Get availability for multiple events | ❌ |
| `GET` | `/api/v1/event-availability/all/active` | Get availability for all active events | ❌ |

**Summary:** 20 Total Endpoints | 14 Public | 6 Admin Required


### Response Format Examples

#### Success Response (Single Item)
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "0812345678",
    "role": "customer"
  }
}
```

#### Success Response (List)
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Concert",
      "venue": "Arena"
    }
  ]
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Event not found",
  "data": null
}
```

#### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "capacity",
        "message": "Must be greater than 0"
      }
    ]
  }
}
```

## 🏗️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Events Table
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(500) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    status event_status NOT NULL DEFAULT 'active',
    total_tickets_sold INTEGER DEFAULT 0 CHECK (total_tickets_sold >= 0),
    total_revenue DECIMAL(10,2) DEFAULT 0 CHECK (total_revenue >= 0),
    total_bookings INTEGER DEFAULT 0 CHECK (total_bookings >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_future_event CHECK (date_time > CURRENT_TIMESTAMP)
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status booking_status NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tickets Table
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    ticket_code VARCHAR(100) UNIQUE NOT NULL,
    status ticket_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### ENUM Types
```sql
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE event_status AS ENUM ('active', 'cancelled', 'completed');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('active', 'used', 'cancelled');
```

## 🔧 Business Logic Features

### Ticket Availability Validation

- Automatically checks available capacity before booking
- Prevents overbooking with database-level constraints
- Returns clear error messages for insufficient tickets
- Real-time capacity tracking with computed fields

### Secure Ticket Code Generation

- Auto-generated unique ticket codes in format: `TKT-YYYYMMDD-XXXXXXXX`
- Cryptographically secure random generation
- Database-level uniqueness validation
- Automatic assignment upon booking confirmation

### Performance Optimization

- Computed fields for real-time statistics (total_tickets_sold, total_revenue, total_bookings)
- Automatic updates via database triggers
- Eliminates N+1 query problems
- Strategic indexes for optimal query performance

### Data Validation

- Comprehensive input validation using Pydantic v2
- Phone number uniqueness enforcement
- Positive quantity and price validation
- Future date validation for events
- Role-based access control

### Booking Management

- Automatic total amount calculation based on event price
- Individual ticket generation for each booking quantity
- Cascade status updates (cancelled bookings → cancelled tickets)
- Real-time event statistics updates

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
curl -X POST "http://localhost:8000/api/v1/bookings" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": 1,
       "event_id": 1,
       "quantity": 2
     }'
```

**Get events:**
```bash
curl -X GET "http://localhost:8000/api/v1/events"
```

### Using the Interactive Docs
Visit `http://localhost:8000/docs` for a complete interactive API documentation where you can test all endpoints directly.

## � Migration Guide

### Frontend Integration Updates

When integrating with the new versioned API, update your frontend code to handle the new response format:

#### Before (Old Format)
```javascript
// Old API call
const response = await fetch('/api/events');
const events = await response.json(); // Direct array

// Error handling
if (!response.ok) {
  // Handle different error formats
  console.error('API Error');
}
```

#### After (New Format)
```javascript
// New API call with versioning
const response = await fetch('/api/v1/events');
const result = await response.json();

if (result.success) {
  const events = result.data; // Data is in result.data
  console.log(result.message); // Success message
} else {
  console.error(result.message); // Standardized error message
}
```

#### TypeScript Interface
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// Usage
const response: ApiResponse<Event[]> = await apiCall('/api/v1/events');
```

### API Client Example
```typescript
class ApiClient {
  private baseUrl = 'http://localhost:8000/api/v1';

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data!;
  }

  // Usage examples
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/events');
  }

  async createBooking(booking: CreateBookingRequest): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
  }
}
```

## �🚀 Production Considerations

### Security
- Implement proper JWT/OAuth authentication middleware
- Add rate limiting and request throttling
- Use environment variables for all sensitive configuration
- Enable CORS properly for frontend integration
- Add input sanitization and SQL injection protection
- Implement API key management for admin operations

### Database
- ✅ PostgreSQL already configured for production use
- ✅ Database migrations system in place with versioning
- ✅ Proper indexes and constraints implemented
- Add database connection pooling and monitoring
- Set up database backups and disaster recovery
- Configure read replicas for scaling

### Performance
- ✅ Computed fields implemented to avoid N+1 queries
- ✅ Strategic database indexes in place
- Add Redis caching for frequently accessed data
- Implement pagination for large result sets
- Add query optimization and monitoring
- Set up application performance monitoring (APM)

### Architecture
- ✅ Clean Architecture implemented with proper separation
- ✅ API versioning strategy in place
- ✅ Structured error handling and responses
- Add comprehensive logging with structured formats
- Implement health checks and metrics endpoints
- Set up container orchestration (Kubernetes/Docker Swarm)


## 📁 Project Structure

```
back-end/
├── src/                           # Source code with Clean Architecture
│   ├── main.py                   # FastAPI application entry point
│   ├── container.py              # Dependency injection container
│   ├── application/              # Application layer (Use Cases)
│   │   ├── dtos/                # Data Transfer Objects
│   │   └── use_cases/           # Business logic use cases
│   ├── domain/                   # Domain layer (Entities, Services)
│   │   ├── entities/            # Domain entities
│   │   ├── repositories/        # Repository interfaces
│   │   └── services/            # Domain services
│   ├── infrastructure/           # Infrastructure layer
│   │   ├── database/            # Database connections & models
│   │   ├── repositories/        # Repository implementations
│   │   └── notifications/       # External service integrations
│   └── presentation/             # Presentation layer (API)
│       ├── api/                 # API versioning and routing
│       │   └── v1/              # Version 1 endpoints
│       ├── controllers/         # Request handlers
│       ├── schemas/             # Pydantic schemas
│       └── utils/               # Response utilities
├── migrations/                   # Database migration scripts
│   ├── 001_initial_schema.sql
│   ├── 002_sample_data.sql
│   ├── 003_add_computed_fields.sql
│   └── 004_test_seed_data.sql
├── docker/                       # Docker configuration
│   └── init-scripts/            # Database initialization
├── docker-compose.yml           # PostgreSQL + pgAdmin setup
├── run_migrations.sh            # Migration management script
├── create_sample_data.py        # Sample data generation
├── requirements.txt             # Python dependencies
├── pyproject.toml              # Project configuration
└── README_API.md               # This documentation
```

## 🤝 API Design Decisions

1. **Clean Architecture**: Proper separation of concerns with distinct layers for maintainability
2. **API Versioning**: URL-based versioning (`/api/v1/`) for backward compatibility
3. **RESTful Design**: Following REST principles for intuitive API structure
4. **Status Enums**: Using PostgreSQL ENUMs for status fields to ensure data consistency
5. **Relationship Handling**: Proper foreign key relationships with CASCADE DELETE
6. **Validation**: Comprehensive input validation at multiple layers (Pydantic, database constraints)
7. **Error Responses**: Consistent HTTP status codes and structured error messages
8. **Response Models**: Structured response schemas with success/error indicators
9. **Performance**: Computed fields and strategic indexing for optimal query performance
10. **Security**: Role-based access patterns ready for authentication middleware

## 🔧 Development Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL database
docker-compose up -d

# Apply database migrations
./run_migrations.sh up

# Check migration status
./run_migrations.sh status

# Create sample data
python create_sample_data.py

# Start development server
fastapi dev src/main.py

# Start production server  
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Database management
./run_migrations.sh help  # See all migration options
```

## 🗄️ Database Management

### PostgreSQL Setup
The project uses PostgreSQL with Docker for easy setup:

```bash
# Start database services
docker-compose up -d

# Access PostgreSQL directly
PGPASSWORD=ticketing_password psql -h localhost -p 5432 -U ticketing_user -d event_ticketing

# Access pgAdmin (Database GUI)
# URL: http://localhost:8080
# Email: admin@ticketing.com  
# Password: admin123
```

### Migration Management
```bash
# Apply all pending migrations
./run_migrations.sh up

# Check what migrations have been applied
./run_migrations.sh status

# Reset database (⚠️ Destructive - removes all data)
./run_migrations.sh reset
```

---

### 