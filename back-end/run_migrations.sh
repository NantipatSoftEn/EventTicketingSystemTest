#!/bin/bash

# Migration Runner Script for Event Ticketing System
# Usage: ./run_migrations.sh [up|down|status]

set -e

# Database configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="event_ticketing"
DB_USER="ticketing_user"
DB_PASSWORD="ticketing_password"

# Migration directory
MIGRATIONS_DIR="./migrations"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if database is accessible
check_database() {
    print_message $YELLOW "Checking database connection..."
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
        print_message $GREEN "✓ Database connection successful"
        return 0
    else
        print_message $RED "✗ Database connection failed"
        print_message $RED "Make sure PostgreSQL is running and docker-compose is up"
        return 1
    fi
}

# Function to create migration tracking table
create_migration_table() {
    print_message $YELLOW "Creating migration tracking table..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            migration_name VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    " >/dev/null
    print_message $GREEN "✓ Migration tracking table ready"
}

# Function to check if migration has been applied
is_migration_applied() {
    local migration_name=$1
    local count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
        SELECT COUNT(*) FROM schema_migrations WHERE migration_name = '$migration_name';
    " 2>/dev/null | tr -d ' ')
    
    if [ "$count" -gt 0 ]; then
        return 0  # Migration applied
    else
        return 1  # Migration not applied
    fi
}

# Function to mark migration as applied
mark_migration_applied() {
    local migration_name=$1
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        INSERT INTO schema_migrations (migration_name) VALUES ('$migration_name');
    " >/dev/null
}

# Function to apply a migration
apply_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file" .sql)
    
    if is_migration_applied "$migration_name"; then
        print_message $YELLOW "⏭  Skipping $migration_name (already applied)"
        return 0
    fi
    
    print_message $YELLOW "📄 Applying migration: $migration_name"
    
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_file" >/dev/null 2>&1; then
        mark_migration_applied "$migration_name"
        print_message $GREEN "✓ Successfully applied $migration_name"
        return 0
    else
        print_message $RED "✗ Failed to apply $migration_name"
        return 1
    fi
}

# Function to run all pending migrations
run_migrations_up() {
    print_message $GREEN "🚀 Starting migration process..."
    
    if ! check_database; then
        exit 1
    fi
    
    create_migration_table
    
    local migration_count=0
    for migration_file in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration_file" ]; then
            apply_migration "$migration_file"
            migration_count=$((migration_count + 1))
        fi
    done
    
    if [ $migration_count -eq 0 ]; then
        print_message $YELLOW "No migration files found in $MIGRATIONS_DIR"
    else
        print_message $GREEN "🎉 Migration process completed!"
    fi
}

# Function to show migration status
show_migration_status() {
    print_message $GREEN "📊 Migration Status:"
    
    if ! check_database; then
        exit 1
    fi
    
    create_migration_table
    
    echo ""
    printf "%-40s %s\n" "Migration" "Status"
    printf "%-40s %s\n" "=========" "======"
    
    for migration_file in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration_file" ]; then
            local migration_name=$(basename "$migration_file" .sql)
            if is_migration_applied "$migration_name"; then
                printf "%-40s %s\n" "$migration_name" "✓ Applied"
            else
                printf "%-40s %s\n" "$migration_name" "✗ Pending"
            fi
        fi
    done
    echo ""
}

# Function to reset database (WARNING: destructive)
reset_database() {
    print_message $RED "⚠️  WARNING: This will drop all tables and data!"
    read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message $YELLOW "Resetting database..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO ticketing_user;
            GRANT ALL ON SCHEMA public TO public;
        " >/dev/null
        print_message $GREEN "✓ Database reset completed"
        print_message $YELLOW "Run './run_migrations.sh up' to recreate the schema"
    else
        print_message $YELLOW "Database reset cancelled"
    fi
}

# Main script logic
case "${1:-up}" in
    "up")
        run_migrations_up
        ;;
    "status")
        show_migration_status
        ;;
    "reset")
        reset_database
        ;;
    "help"|"-h"|"--help")
        echo "Event Ticketing System Migration Runner"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  up      Apply all pending migrations (default)"
        echo "  status  Show migration status"
        echo "  reset   Reset database (WARNING: destructive)"
        echo "  help    Show this help message"
        echo ""
        ;;
    *)
        print_message $RED "Unknown command: $1"
        print_message $YELLOW "Use '$0 help' to see available commands"
        exit 1
        ;;
esac
