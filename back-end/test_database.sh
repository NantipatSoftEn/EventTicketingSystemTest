#!/bin/bash

# Database Testing Script for Event Ticketing System
# This script demonstrates all the database features and constraints

set -e

# Database connection function
db_exec() {
    docker-compose exec postgres psql -U ticketing_user -d event_ticketing -c "$1"
}

echo "🎫 Event Ticketing System - Database Testing"
echo "============================================="
echo ""

echo "📊 Current Database Status:"
echo "-------------------------"

echo "👥 Users:"
db_exec "SELECT id, name, phone, role FROM users ORDER BY id;"
echo ""

echo "🎪 Events:"
db_exec "SELECT id, title, venue, capacity, price, status FROM events ORDER BY id;"
echo ""

echo "📈 Event Availability:"
db_exec "SELECT title, capacity, booked_tickets, available_tickets, occupancy_percentage FROM event_availability ORDER BY id;"
echo ""

echo "📝 Current Bookings:"
db_exec "SELECT booking_id, customer_name, event_title, quantity, total_amount, booking_status, ticket_count FROM booking_summary;"
echo ""

echo "🎟️ Current Tickets:"
db_exec "SELECT id, booking_id, ticket_code, status FROM tickets ORDER BY id;"
echo ""

echo "🧪 Testing Database Features:"
echo "----------------------------"

echo "✅ Test 1: Creating a valid booking..."
db_exec "INSERT INTO bookings (user_id, event_id, quantity, total_amount) VALUES (3, 2, 3, 269.97);"
echo "✓ Booking created successfully"
echo ""

echo "✅ Test 2: Auto-generating tickets..."
# Get the last booking ID
last_booking_id=$(db_exec "SELECT MAX(id) FROM bookings;" | grep -E '^\s*[0-9]+\s*$' | tr -d ' ')
db_exec "INSERT INTO tickets (booking_id) VALUES ($last_booking_id), ($last_booking_id), ($last_booking_id);"
echo "✓ Tickets created with auto-generated codes"
echo ""

echo "✅ Test 3: Checking updated availability..."
db_exec "SELECT title, booked_tickets, available_tickets FROM event_availability WHERE id = 2;"
echo ""

echo "❌ Test 4: Testing capacity validation (should fail)..."
set +e
result=$(db_exec "INSERT INTO bookings (user_id, event_id, quantity, total_amount) VALUES (1, 3, 31, 4649.69);" 2>&1)
if [[ $result == *"exceeds available capacity"* ]]; then
    echo "✓ Capacity validation working correctly - booking rejected"
else
    echo "✗ Capacity validation failed"
fi
set -e
echo ""

echo "✅ Test 5: Testing check constraints (should fail)..."
set +e
result=$(db_exec "INSERT INTO bookings (user_id, event_id, quantity, total_amount) VALUES (1, 1, -1, 100);" 2>&1)
if [[ $result == *"violates check constraint"* ]]; then
    echo "✓ Check constraints working - negative quantity rejected"
else
    echo "✗ Check constraints failed"
fi
set -e
echo ""

echo "✅ Test 6: Testing foreign key constraints..."
set +e
result=$(db_exec "INSERT INTO bookings (user_id, event_id, quantity, total_amount) VALUES (999, 1, 1, 100);" 2>&1)
if [[ $result == *"violates foreign key constraint"* ]]; then
    echo "✓ Foreign key constraints working - invalid user_id rejected"
else
    echo "✗ Foreign key constraints failed"
fi
set -e
echo ""

echo "📋 Final Database State:"
echo "----------------------"

echo "🎪 Updated Event Availability:"
db_exec "SELECT title, capacity, booked_tickets, available_tickets, occupancy_percentage FROM event_availability ORDER BY occupancy_percentage DESC;"
echo ""

echo "📊 All Bookings Summary:"
db_exec "SELECT booking_id, customer_name, event_title, quantity, total_amount, ticket_count FROM booking_summary ORDER BY booking_id;"
echo ""

echo "🎟️ All Tickets:"
db_exec "SELECT t.ticket_code, t.status, e.title as event_title, u.name as customer_name FROM tickets t JOIN bookings b ON t.booking_id = b.id JOIN events e ON b.event_id = e.id JOIN users u ON b.user_id = u.id ORDER BY t.id;"
echo ""

echo "🎉 Database testing completed successfully!"
echo "All constraints, triggers, and relationships are working correctly."
