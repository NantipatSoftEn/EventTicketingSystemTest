# Event Ticketing System - Docker Setup

This directory contains Docker configuration files for the Event Ticketing System.

## Files

- `docker-compose.yml` - Main Docker Compose configuration in the root directory
- `init-scripts/01-init.sql` - PostgreSQL initialization script

## Services

### PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: event_ticketing
- **Username**: ticketing_user
- **Password**: ticketing_password

### pgAdmin (Database Management)
- **Image**: dpage/pgadmin4:latest
- **Port**: 8080
- **Email**: admin@ticketing.com
- **Password**: admin123

## Usage

### Start PostgreSQL only:
```bash
docker-compose up -d postgres
```

### Start all services:
```bash
docker-compose up -d
```

### Stop services:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs postgres
docker-compose logs pgadmin
```

### Remove volumes (WARNING: Deletes all data):
```bash
docker-compose down -v
```

## Database Connection

After starting the PostgreSQL container, your FastAPI application will connect using the DATABASE_URL in the `.env` file:

```
postgresql://ticketing_user:ticketing_password@localhost:5432/event_ticketing
```

## pgAdmin Access

Once pgAdmin is running, access it at:
- URL: http://localhost:8080
- Email: admin@ticketing.com
- Password: admin123

To connect to the PostgreSQL database in pgAdmin:
1. Right-click "Servers" and select "Create > Server"
2. Name: Event Ticketing DB
3. Host: postgres (container name) or localhost
4. Port: 5432
5. Database: event_ticketing
6. Username: ticketing_user
7. Password: ticketing_password
