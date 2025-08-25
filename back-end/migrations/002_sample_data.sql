-- Migration 002: Sample Data
-- Event Ticketing System Sample Data
-- Created: 2025-08-25
-- Description: Inserts sample data for testing the system

BEGIN;

-- Insert sample users
INSERT INTO users (name, phone, role) VALUES 
    ('John Admin', '+1234567890', 'admin'),
    ('Alice Customer', '+1234567891', 'customer'),
    ('Bob Customer', '+1234567892', 'customer'),
    ('Charlie Customer', '+1234567893', 'customer'),
    ('Diana Customer', '+1234567894', 'customer');

-- Insert sample events
INSERT INTO events (title, description, venue, date_time, capacity, price) VALUES 
    ('Tech Conference 2025', 'Annual technology conference with industry leaders', 'Convention Center Hall A', '2025-09-15 09:00:00+00', 500, 299.99),
    ('Music Festival', 'Summer music festival featuring local and international artists', 'City Park Amphitheater', '2025-08-30 18:00:00+00', 1000, 89.99),
    ('Workshop: Web Development', 'Hands-on workshop for learning modern web development', 'Tech Hub Room 101', '2025-09-01 10:00:00+00', 30, 149.99),
    ('Food & Wine Tasting', 'Exclusive tasting event with local chefs and wineries', 'Downtown Restaurant', '2025-09-10 19:00:00+00', 50, 125.00),
    ('Art Exhibition Opening', 'Opening night for the contemporary art exhibition', 'City Art Gallery', '2025-08-28 18:30:00+00', 200, 25.00);

-- Insert sample bookings
INSERT INTO bookings (user_id, event_id, quantity, total_amount, status) VALUES 
    (2, 1, 2, 599.98, 'confirmed'),  -- Alice books 2 tickets for Tech Conference
    (3, 2, 4, 359.96, 'confirmed'),  -- Bob books 4 tickets for Music Festival
    (4, 3, 1, 149.99, 'confirmed'),  -- Charlie books 1 ticket for Web Dev Workshop
    (5, 1, 1, 299.99, 'confirmed'),  -- Diana books 1 ticket for Tech Conference
    (2, 4, 2, 250.00, 'confirmed');  -- Alice books 2 tickets for Food & Wine

-- Insert sample tickets (these will be auto-generated with ticket codes)
INSERT INTO tickets (booking_id) VALUES 
    (1), (1),  -- 2 tickets for Alice's Tech Conference booking
    (2), (2), (2), (2),  -- 4 tickets for Bob's Music Festival booking
    (3),  -- 1 ticket for Charlie's Workshop booking
    (4),  -- 1 ticket for Diana's Tech Conference booking
    (5), (5);  -- 2 tickets for Alice's Food & Wine booking

COMMIT;
