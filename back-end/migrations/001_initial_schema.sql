-- Migration 001: Initial Schema
-- Event Ticketing System Database Schema
-- Created: 2025-08-25
-- Description: Creates the initial database schema with all core entities

-- This migration creates:
-- 1. ENUM types for status fields
-- 2. Core tables: users, events, bookings, tickets
-- 3. Foreign key relationships
-- 4. Check constraints for data integrity
-- 5. Strategic indexes for performance
-- 6. Triggers for auto-generated fields
-- 7. Business logic triggers (capacity validation)
-- 8. Useful views for reporting

BEGIN;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE event_status AS ENUM ('active', 'cancelled', 'completed');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('active', 'used', 'cancelled');

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(500) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status event_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Check constraints
    CONSTRAINT chk_capacity_positive CHECK (capacity > 0),
    CONSTRAINT chk_price_positive CHECK (price >= 0),
    CONSTRAINT chk_future_event CHECK (date_time > CURRENT_TIMESTAMP)
);

-- Create Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status booking_status NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_total_amount_positive CHECK (total_amount >= 0)
);

-- Create Tickets table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    ticket_code VARCHAR(100) UNIQUE NOT NULL,
    status ticket_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_ticket_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create strategic indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_events_date_time ON events(date_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_venue ON events(venue);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);

CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
CREATE INDEX idx_tickets_ticket_code ON tickets(ticket_code);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Function to generate unique ticket codes
CREATE OR REPLACE FUNCTION generate_ticket_code() RETURNS VARCHAR(100) AS $$
DECLARE
    new_code VARCHAR(100);
    exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                   UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
        
        SELECT EXISTS(SELECT 1 FROM tickets WHERE ticket_code = new_code) INTO exists;
        
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket codes
CREATE OR REPLACE FUNCTION set_ticket_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_code IS NULL OR NEW.ticket_code = '' THEN
        NEW.ticket_code := generate_ticket_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_code
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_code();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at columns
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate booking capacity
CREATE OR REPLACE FUNCTION check_booking_capacity() RETURNS TRIGGER AS $$
DECLARE
    event_capacity INTEGER;
    current_bookings INTEGER;
    available_capacity INTEGER;
BEGIN
    -- Get event capacity
    SELECT capacity INTO event_capacity FROM events WHERE id = NEW.event_id;
    
    -- Get current confirmed bookings for this event
    SELECT COALESCE(SUM(quantity), 0) INTO current_bookings 
    FROM bookings 
    WHERE event_id = NEW.event_id AND status = 'confirmed';
    
    -- Calculate available capacity
    available_capacity := event_capacity - current_bookings;
    
    -- Check if new booking exceeds capacity
    IF NEW.quantity > available_capacity THEN
        RAISE EXCEPTION 'Booking quantity (%) exceeds available capacity (%). Event capacity: %, Current bookings: %', 
            NEW.quantity, available_capacity, event_capacity, current_bookings;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check booking capacity
CREATE TRIGGER trigger_check_booking_capacity
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed')
    EXECUTE FUNCTION check_booking_capacity();

-- Create a view for booking summary
CREATE VIEW booking_summary AS
SELECT 
    b.id as booking_id,
    u.name as customer_name,
    u.phone as customer_phone,
    e.title as event_title,
    e.venue as event_venue,
    e.date_time as event_date,
    b.quantity,
    b.total_amount,
    b.status as booking_status,
    b.booking_date,
    COUNT(t.id) as ticket_count
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN events e ON b.event_id = e.id
LEFT JOIN tickets t ON b.id = t.booking_id
GROUP BY b.id, u.name, u.phone, e.title, e.venue, e.date_time, b.quantity, b.total_amount, b.status, b.booking_date
ORDER BY b.booking_date DESC;

-- Create a view for event availability
CREATE VIEW event_availability AS
SELECT 
    e.id,
    e.title,
    e.venue,
    e.date_time,
    e.capacity,
    e.price,
    e.status,
    COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.quantity ELSE 0 END), 0) as booked_tickets,
    e.capacity - COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.quantity ELSE 0 END), 0) as available_tickets,
    ROUND(
        (COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.quantity ELSE 0 END), 0) * 100.0) / e.capacity, 
        2
    ) as occupancy_percentage
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id
GROUP BY e.id, e.title, e.venue, e.date_time, e.capacity, e.price, e.status
ORDER BY e.date_time;

COMMIT;
