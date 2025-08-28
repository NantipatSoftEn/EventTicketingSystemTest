-- Migration 003: Add computed fields to events table
-- This migration adds computed fields to avoid N+1 queries
-- Created: 2025-08-28

BEGIN;

-- Add computed fields to events table
ALTER TABLE events ADD COLUMN total_tickets_sold INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN total_revenue DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE events ADD COLUMN total_bookings INTEGER DEFAULT 0;

-- Add check constraints
ALTER TABLE events ADD CONSTRAINT chk_total_tickets_sold_non_negative CHECK (total_tickets_sold >= 0);
ALTER TABLE events ADD CONSTRAINT chk_total_revenue_non_negative CHECK (total_revenue >= 0);
ALTER TABLE events ADD CONSTRAINT chk_total_bookings_non_negative CHECK (total_bookings >= 0);

-- Initialize existing data
UPDATE events SET 
    total_tickets_sold = COALESCE((
        SELECT SUM(quantity) 
        FROM bookings 
        WHERE event_id = events.id AND status = 'confirmed'
    ), 0),
    total_revenue = COALESCE((
        SELECT SUM(total_amount) 
        FROM bookings 
        WHERE event_id = events.id AND status = 'confirmed'
    ), 0),
    total_bookings = COALESCE((
        SELECT COUNT(*) 
        FROM bookings 
        WHERE event_id = events.id AND status = 'confirmed'
    ), 0);

-- Create function to update event statistics
CREATE OR REPLACE FUNCTION update_event_stats() RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE cases
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'confirmed') THEN
        -- Update for the new/confirmed booking
        UPDATE events SET 
            total_tickets_sold = total_tickets_sold + 
                CASE WHEN TG_OP = 'INSERT' THEN NEW.quantity 
                     ELSE (NEW.quantity - COALESCE(OLD.quantity, 0))
                END,
            total_revenue = total_revenue + 
                CASE WHEN TG_OP = 'INSERT' THEN NEW.total_amount
                     ELSE (NEW.total_amount - COALESCE(OLD.total_amount, 0))
                END,
            total_bookings = total_bookings + 
                CASE WHEN TG_OP = 'INSERT' THEN 1
                     WHEN OLD.status != 'confirmed' THEN 1
                     ELSE 0
                END
        WHERE id = NEW.event_id;
    END IF;
    
    -- Handle cancellation/deletion
    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed') THEN
        UPDATE events SET 
            total_tickets_sold = total_tickets_sold - OLD.quantity,
            total_revenue = total_revenue - OLD.total_amount,
            total_bookings = total_bookings - 1
        WHERE id = OLD.event_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updates
CREATE TRIGGER trigger_update_event_stats
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_event_stats();

-- Update the event_availability view to use computed fields
DROP VIEW IF EXISTS event_availability;
CREATE VIEW event_availability AS
SELECT 
    e.id,
    e.title,
    e.venue,
    e.date_time,
    e.capacity,
    e.price,
    e.status,
    e.total_tickets_sold as booked_tickets,
    e.capacity - e.total_tickets_sold as available_tickets,
    ROUND(
        (e.total_tickets_sold * 100.0) / e.capacity, 
        2
    ) as occupancy_percentage,
    e.total_revenue,
    e.total_bookings
FROM events e
ORDER BY e.date_time;

COMMIT;
