# Database Management Guide

## Overview
This guide explains how to manage the database schema and migrations for the Event Ticketing System.

## Quick Start

### 1. Start the Database
```bash
cd /Users/Army/EventTicketingSystemTest/back-end
docker-compose up -d
```

### 2. Apply Migrations
```bash
./run_migrations.sh up
```

### 3. Check Migration Status
```bash
./run_migrations.sh status
```

## Database Schema

### Core Entities

#### Users Table
- **id**: Primary key (Serial)
- **name**: User's full name (VARCHAR(255), NOT NULL)
- **phone**: Unique phone number (VARCHAR(20), UNIQUE, NOT NULL)
- **role**: User role (ENUM: 'customer', 'admin', DEFAULT: 'customer')
- **created_at**: Timestamp with timezone (DEFAULT: CURRENT_TIMESTAMP)
- **updated_at**: Timestamp with timezone (DEFAULT: CURRENT_TIMESTAMP)

#### Events Table
- **id**: Primary key (Serial)
- **title**: Event title (VARCHAR(255), NOT NULL)
- **description**: Event description (TEXT)
- **venue**: Event location (VARCHAR(500), NOT NULL)
- **date_time**: Event date and time (TIMESTAMP WITH TIME ZONE, NOT NULL)
- **capacity**: Maximum attendees (INTEGER, NOT NULL, CHECK: > 0)
- **price**: Ticket price (DECIMAL(10,2), NOT NULL, CHECK: >= 0)
- **status**: Event status (ENUM: 'active', 'cancelled', 'completed', DEFAULT: 'active')
- **total_tickets_sold**: Computed field - total confirmed tickets sold (INTEGER, DEFAULT: 0, CHECK: >= 0)
- **total_revenue**: Computed field - total revenue from confirmed bookings (DECIMAL(10,2), DEFAULT: 0, CHECK: >= 0)
- **total_bookings**: Computed field - total number of confirmed bookings (INTEGER, DEFAULT: 0, CHECK: >= 0)
- **created_at**: Timestamp with timezone (DEFAULT: CURRENT_TIMESTAMP)
- **updated_at**: Timestamp with timezone (DEFAULT: CURRENT_TIMESTAMP)

#### Bookings Table
- **id**: Primary key (Serial)
- **user_id**: Foreign key to users (INTEGER, NOT NULL)
- **event_id**: Foreign key to events (INTEGER, NOT NULL)
- **quantity**: Number of tickets (INTEGER, NOT NULL, CHECK: > 0)
- **total_amount**: Total booking amount (DECIMAL(10,2), NOT NULL, CHECK: >= 0)
- **booking_date**: When booking was made (TIMESTAMP WITH TIME ZONE, DEFAULT: CURRENT_TIMESTAMP)
- **status**: Booking status (ENUM: 'confirmed', 'cancelled', DEFAULT: 'confirmed')
- **created_at**: Timestamp with timezone (DEFAULT: CURRENT_TIMESTAMP)
- **updated_at**: Timestamp with timezone (DEFAULT: CURRENT_TIMESTAMP)

#### Tickets Table
- **id**: Primary key (Serial)
- **booking_id**: Foreign key to bookings (INTEGER, NOT NULL)
- **ticket_code**: Unique ticket identifier (VARCHAR(100), UNIQUE, NOT NULL)
- **status**: Ticket status (ENUM: 'active', 'used', 'cancelled', DEFAULT: 'active')
- **created_at**: Timestamp with timezone (DEFAULT: CURRENT_TIMESTAMP)
- **updated_at**: Timestamp with timezone (DEFAULT: CURRENT_TIMESTAMP)

### Relationships
- **Users** → **Bookings** (1:N) - One user can have multiple bookings
- **Events** → **Bookings** (1:N) - One event can have multiple bookings
- **Bookings** → **Tickets** (1:N) - One booking can have multiple tickets

### Constraints and Features

#### Check Constraints
- Event capacity must be positive
- Event price must be non-negative
- Event date must be in the future
- Event computed fields (total_tickets_sold, total_revenue, total_bookings) must be non-negative
- Booking quantity must be positive
- Total amount must be non-negative

#### Foreign Key Constraints
- All foreign keys have CASCADE DELETE to maintain referential integrity
- Deleting a user will delete all their bookings and tickets
- Deleting an event will delete all related bookings and tickets
- Deleting a booking will delete all related tickets

#### Indexes
Strategic indexes are created for:
- User phone numbers and roles
- Event dates, status, and venues
- Booking user_id, event_id, status, and dates
- Ticket booking_id, codes, and status

#### Triggers and Functions

1. **Auto-generated Ticket Codes**
   - Automatic generation of unique ticket codes in format: `TKT-YYYYMMDD-XXXXXXXX`
   - Ensures uniqueness across the system

2. **Updated At Timestamps**
   - Automatically updates `updated_at` field on record modifications

3. **Booking Capacity Validation**
   - Prevents overbooking by checking available capacity before confirming bookings
   - Raises exceptions if booking would exceed event capacity

4. **Event Statistics Updates**
   - Automatically updates computed fields (total_tickets_sold, total_revenue, total_bookings) when bookings change
   - Maintains real-time statistics for performance optimization

#### Views

1. **booking_summary**: Complete booking information with user and event details
2. **event_availability**: Event capacity and availability statistics with computed fields (booked_tickets, available_tickets, occupancy_percentage, total_revenue, total_bookings)

## Migration Commands

### Apply All Pending Migrations
```bash
./run_migrations.sh up
```

### Check Migration Status
```bash
./run_migrations.sh status
```

### Reset Database (⚠️ Destructive)
```bash
./run_migrations.sh reset
```

### Get Help
```bash
./run_migrations.sh help
```

## Manual Database Access

### Using psql
```bash
PGPASSWORD=ticketing_password psql -h localhost -p 5432 -U ticketing_user -d event_ticketing
```

### Using pgAdmin
- URL: http://localhost:8080
- Email: admin@ticketing.com
- Password: admin123

Then add a new server:
- Host: postgres (or localhost if accessing from outside Docker)
- Port: 5432
- Username: ticketing_user
- Password: ticketing_password
- Database: event_ticketing

## Sample Queries

### Get Event Availability
```sql
SELECT * FROM event_availability WHERE status = 'active';
```

### Get User Bookings
```sql
SELECT * FROM booking_summary WHERE customer_name = 'Alice Customer';
```

### Check Capacity for Event
```sql
SELECT 
    title,
    capacity,
    booked_tickets,
    available_tickets,
    occupancy_percentage,
    total_revenue,
    total_bookings
FROM event_availability 
WHERE id = 1;
```

### Get All Active Tickets
```sql
SELECT 
    t.ticket_code,
    t.status,
    e.title as event_title,
    e.date_time,
    u.name as customer_name
FROM tickets t
JOIN bookings b ON t.booking_id = b.id
JOIN events e ON b.event_id = e.id
JOIN users u ON b.user_id = u.id
WHERE t.status = 'active'
ORDER BY e.date_time;
```

### Get Event Revenue and Statistics
```sql
SELECT 
    id,
    title,
    venue,
    date_time,
    capacity,
    total_tickets_sold,
    total_revenue,
    total_bookings,
    ROUND((total_tickets_sold::DECIMAL / capacity) * 100, 2) as occupancy_percentage
FROM events 
WHERE status = 'active'
ORDER BY total_revenue DESC;
```

## Troubleshooting

### Database Connection Issues
1. Ensure Docker containers are running: `docker-compose ps`
2. Check container logs: `docker-compose logs postgres`
3. Verify port availability: `lsof -i :5432`

### Migration Issues
1. Check database connectivity
2. Verify migration file syntax
3. Check for existing schema conflicts
4. Review migration tracking table: `SELECT * FROM schema_migrations;`

### Performance Issues
1. Analyze query execution plans: `EXPLAIN ANALYZE your_query;`
2. Monitor index usage: `SELECT * FROM pg_stat_user_indexes;`
3. Check table statistics: `SELECT * FROM pg_stat_user_tables;`

## Backup and Restore

### Create Backup
```bash
PGPASSWORD=ticketing_password pg_dump -h localhost -p 5432 -U ticketing_user -d event_ticketing > backup.sql
```

### Restore from Backup
```bash
PGPASSWORD=ticketing_password psql -h localhost -p 5432 -U ticketing_user -d event_ticketing < backup.sql
```
