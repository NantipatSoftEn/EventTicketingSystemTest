# Event Ticketing System - Diagrams

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        SERIAL id PK
        VARCHAR name "NOT NULL"
        VARCHAR phone "UNIQUE, NOT NULL"
        user_role role "DEFAULT 'customer'"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    EVENTS {
        SERIAL id PK
        VARCHAR title "NOT NULL"
        TEXT description
        VARCHAR venue "NOT NULL"
        TIMESTAMP date_time "NOT NULL"
        INTEGER capacity "NOT NULL, CHECK > 0"
        DECIMAL price "NOT NULL, CHECK >= 0"
        event_status status "DEFAULT 'active'"
        INTEGER total_tickets_sold "DEFAULT 0"
        DECIMAL total_revenue "DEFAULT 0"
        INTEGER total_bookings "DEFAULT 0"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    BOOKINGS {
        SERIAL id PK
        INTEGER user_id FK "NOT NULL"
        INTEGER event_id FK "NOT NULL"
        INTEGER quantity "NOT NULL, CHECK > 0"
        DECIMAL total_amount "NOT NULL, CHECK >= 0"
        TIMESTAMP booking_date "DEFAULT CURRENT_TIMESTAMP"
        booking_status status "DEFAULT 'confirmed'"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    TICKETS {
        SERIAL id PK
        INTEGER booking_id FK "NOT NULL"
        VARCHAR ticket_code "UNIQUE, NOT NULL"
        ticket_status status "DEFAULT 'active'"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    SCHEMA_MIGRATIONS {
        SERIAL id PK
        VARCHAR migration_name "UNIQUE, NOT NULL"
        TIMESTAMP applied_at "DEFAULT CURRENT_TIMESTAMP"
    }

    USERS ||--o{ BOOKINGS : "makes"
    EVENTS ||--o{ BOOKINGS : "has"
    BOOKINGS ||--o{ TICKETS : "contains"
```

## 2. System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[Angular Frontend]
        FE --> API[REST API]
    end
    
    subgraph "Backend Layer"
        API --> CTRL[Controllers]
        CTRL --> UC[Use Cases]
        UC --> REPO[Repositories]
        UC --> SERV[Domain Services]
    end
    
    subgraph "Infrastructure Layer"
        REPO --> DB[(PostgreSQL Database)]
        NOTIF[Notification Service]
        CACHE[Cache Layer]
    end
    
    subgraph "External Services"
        PAYMENT[Payment Gateway]
        EMAIL[Email Service]
        SMS[SMS Service]
    end
    
    API --> PAYMENT
    NOTIF --> EMAIL
    NOTIF --> SMS
    
    style FE fill:#e1f5fe
    style API fill:#f3e5f5
    style DB fill:#e8f5e8
    style PAYMENT fill:#fff3e0
    style EMAIL fill:#fff3e0
    style SMS fill:#fff3e0
```

## 3. Clean Architecture Layers (จริงในโปรเจ็กต์)

```mermaid
graph TB
    subgraph "Presentation Layer"
        MAIN[main.py - FastAPI App]
        API_V1[API v1 Router]
        USERS_EP[users endpoints]
        EVENTS_EP[events endpoints]
        BOOKINGS_EP[bookings endpoints]
        AVAIL_EP[availability endpoints]
        SCHEMAS[Response Schemas]
        UTILS[Response Utils]
    end
    
    subgraph "Application Layer"
        UC_USER[User Use Cases]
        UC_EVENT[Event Use Cases]
        UC_BOOKING[Booking Use Cases]
        UC_AVAIL[Event Availability Use Cases]
        USER_DTO[User DTOs]
        EVENT_DTO[Event DTOs]
        BOOKING_DTO[Booking DTOs]
        TICKET_DTO[Ticket DTOs]
    end
    
    subgraph "Domain Layer"
        ENT_USER[User Entity]
        ENT_EVENT[Event Entity]
        ENT_BOOKING[Booking Entity]
        ENT_TICKET[Ticket Entity]
        REPO_USER[UserRepository Interface]
        REPO_EVENT[EventRepository Interface]
        REPO_BOOKING[BookingRepository Interface]
        REPO_TICKET[TicketRepository Interface]
        SERV_BOOKING[BookingService]
        SERV_TICKET[TicketService]
    end
    
    subgraph "Infrastructure Layer"
        REPO_USER_IMPL[UserRepositoryImpl]
        REPO_EVENT_IMPL[EventRepositoryImpl]
        REPO_BOOKING_IMPL[BookingRepositoryImpl]
        REPO_TICKET_IMPL[TicketRepositoryImpl]
        USER_MODEL[UserModel - SQLAlchemy]
        EVENT_MODEL[EventModel - SQLAlchemy]
        BOOKING_MODEL[BookingModel - SQLAlchemy]
        TICKET_MODEL[TicketModel - SQLAlchemy]
        DB_CONN[Database Connection]
    end
    
    MAIN --> API_V1
    API_V1 --> USERS_EP
    API_V1 --> EVENTS_EP
    API_V1 --> BOOKINGS_EP
    API_V1 --> AVAIL_EP
    
    USERS_EP --> UC_USER
    EVENTS_EP --> UC_EVENT
    BOOKINGS_EP --> UC_BOOKING
    AVAIL_EP --> UC_AVAIL
    
    UC_USER --> ENT_USER
    UC_EVENT --> ENT_EVENT
    UC_BOOKING --> ENT_BOOKING
    UC_BOOKING --> SERV_BOOKING
    UC_BOOKING --> SERV_TICKET
    
    UC_USER --> REPO_USER
    UC_EVENT --> REPO_EVENT
    UC_BOOKING --> REPO_BOOKING
    UC_BOOKING --> REPO_TICKET
    
    REPO_USER --> REPO_USER_IMPL
    REPO_EVENT --> REPO_EVENT_IMPL
    REPO_BOOKING --> REPO_BOOKING_IMPL
    REPO_TICKET --> REPO_TICKET_IMPL
    
    REPO_USER_IMPL --> USER_MODEL
    REPO_EVENT_IMPL --> EVENT_MODEL
    REPO_BOOKING_IMPL --> BOOKING_MODEL
    REPO_TICKET_IMPL --> TICKET_MODEL
    
    USER_MODEL --> DB_CONN
    EVENT_MODEL --> DB_CONN
    BOOKING_MODEL --> DB_CONN
    TICKET_MODEL --> DB_CONN
    
    style MAIN fill:#ffebee
    style UC_USER fill:#e8f5e8
    style UC_EVENT fill:#e8f5e8
    style UC_BOOKING fill:#e8f5e8
    style UC_AVAIL fill:#e8f5e8
    style ENT_USER fill:#e3f2fd
    style ENT_EVENT fill:#e3f2fd
    style ENT_BOOKING fill:#e3f2fd
    style ENT_TICKET fill:#e3f2fd
    style REPO_USER_IMPL fill:#fff3e0
    style DB_CONN fill:#fff3e0
```

## 4. Booking Flow Diagram

```mermaid
sequenceDiagram
    participant C as Customer
    participant API as API Gateway
    participant UC as Booking Use Case
    participant ER as Event Repository
    participant BR as Booking Repository
    participant TR as Ticket Repository
    participant DB as Database
    participant NS as Notification Service

    C->>API: POST /bookings
    API->>UC: createBooking(bookingData)
    
    UC->>ER: getEventById(eventId)
    ER->>DB: SELECT event details
    DB-->>ER: event data
    ER-->>UC: event entity
    
    UC->>UC: validateEventAvailability()
    UC->>UC: calculateTotalAmount()
    
    UC->>BR: createBooking(booking)
    BR->>DB: BEGIN TRANSACTION
    BR->>DB: INSERT INTO bookings
    DB-->>BR: booking created
    
    loop for each ticket
        UC->>TR: createTicket(bookingId)
        TR->>DB: INSERT INTO tickets
        DB-->>TR: ticket created with auto-generated code
    end
    
    BR->>DB: COMMIT TRANSACTION
    BR-->>UC: booking confirmed
    
    UC->>NS: sendBookingConfirmation(booking)
    NS-->>UC: notification sent
    
    UC-->>API: booking response
    API-->>C: 201 Created + booking details
```

## 5. Database Triggers and Functions Flow

```mermaid
graph TB
    subgraph "Insert/Update Operations"
        INS_TICKET[Insert Ticket]
        UPD_USER[Update User]
        UPD_EVENT[Update Event]
        UPD_BOOKING[Update Booking]
        INS_BOOKING[Insert Booking]
    end
    
    subgraph "Trigger Functions"
        GEN_CODE[generate_ticket_code()]
        UPDATE_TS[update_updated_at_column()]
        CHECK_CAP[check_booking_capacity()]
        UPDATE_STATS[update_event_statistics()]
    end
    
    subgraph "Validations & Auto-generation"
        UNIQUE_CODE[Ensure Unique Ticket Code]
        TIMESTAMP[Update Timestamp]
        CAPACITY[Validate Capacity]
        STATS[Update Event Stats]
    end
    
    INS_TICKET --> GEN_CODE
    GEN_CODE --> UNIQUE_CODE
    
    UPD_USER --> UPDATE_TS
    UPD_EVENT --> UPDATE_TS
    UPD_BOOKING --> UPDATE_TS
    UPDATE_TS --> TIMESTAMP
    
    INS_BOOKING --> CHECK_CAP
    CHECK_CAP --> CAPACITY
    
    INS_BOOKING --> UPDATE_STATS
    UPD_BOOKING --> UPDATE_STATS
    UPDATE_STATS --> STATS
    
    style INS_TICKET fill:#e1f5fe
    style INS_BOOKING fill:#e1f5fe
    style GEN_CODE fill:#f3e5f5
    style CHECK_CAP fill:#ffebee
    style UPDATE_STATS fill:#e8f5e8
```

## 6. API Endpoints Structure (จริงในโปรเจ็กต์)

```mermaid
graph LR
    subgraph "FastAPI Application"
        MAIN[main.py]
        MAIN --> API_V1[/api/v1/]
    end
    
    subgraph "User Management"
        API_V1 --> USER_EP[/api/v1/users]
        USER_EP --> USER_GET[GET /users]
        USER_EP --> USER_POST[POST /users]
        USER_EP --> USER_PUT[PUT /users/:id]
        USER_EP --> USER_GET_ID[GET /users/:id]
        USER_EP --> USER_GET_PHONE[GET /users/phone/:phone]
    end
    
    subgraph "Event Management"
        API_V1 --> EVENT_EP[/api/v1/events]
        EVENT_EP --> EVENT_GET[GET /events]
        EVENT_EP --> EVENT_POST[POST /events]
        EVENT_EP --> EVENT_PUT[PUT /events/:id]
        EVENT_EP --> EVENT_PATCH[PATCH /events/:id]
        EVENT_EP --> EVENT_GET_ID[GET /events/:id]
        EVENT_EP --> EVENT_DELETE[DELETE /events/:id]
    end
    
    subgraph "Booking Management"
        API_V1 --> BOOKING_EP[/api/v1/bookings]
        BOOKING_EP --> BOOKING_GET[GET /bookings]
        BOOKING_EP --> BOOKING_POST[POST /bookings]
        BOOKING_EP --> BOOKING_GET_ID[GET /bookings/:id]
        BOOKING_EP --> BOOKING_USER[GET /bookings/user/:user_id]
        BOOKING_EP --> BOOKING_EVENT[GET /bookings/event/:event_id]
        BOOKING_EP --> BOOKING_STATS[GET /bookings/stats/:event_id]
    end
    
    subgraph "Availability Management"
        API_V1 --> AVAIL_EP[/api/v1/availability]
        AVAIL_EP --> AVAIL_GET[GET /availability]
        AVAIL_EP --> AVAIL_EVENT[GET /availability/:event_id]
    end
    
    subgraph "System Endpoints"
        MAIN --> ARCH[GET /api/v1/architecture]
        MAIN --> VERSION[GET /api/v1/version]
        MAIN --> HEALTH[GET /health]
    end
    
    style MAIN fill:#e1f5fe
    style USER_EP fill:#f3e5f5
    style EVENT_EP fill:#e8f5e8
    style BOOKING_EP fill:#fff3e0
    style AVAIL_EP fill:#f1f8e9
```

## 7. Data Flow Diagram

```mermaid
graph TD
    subgraph "External Inputs"
        CUSTOMER[Customer Registration]
        ADMIN[Admin Event Creation]
        BOOKING_REQ[Booking Request]
    end
    
    subgraph "Core Processes"
        VALIDATE[Data Validation]
        PROCESS[Business Logic Processing]
        PERSIST[Data Persistence]
        NOTIFY[Notification]
    end
    
    subgraph "Data Stores"
        USER_DB[(Users Table)]
        EVENT_DB[(Events Table)]
        BOOKING_DB[(Bookings Table)]
        TICKET_DB[(Tickets Table)]
    end
    
    subgraph "Outputs"
        CONFIRMATION[Booking Confirmation]
        TICKETS[Generated Tickets]
        NOTIFICATIONS[Email/SMS Notifications]
        REPORTS[Analytics Reports]
    end
    
    CUSTOMER --> VALIDATE
    ADMIN --> VALIDATE
    BOOKING_REQ --> VALIDATE
    
    VALIDATE --> PROCESS
    PROCESS --> PERSIST
    PROCESS --> NOTIFY
    
    PERSIST --> USER_DB
    PERSIST --> EVENT_DB
    PERSIST --> BOOKING_DB
    PERSIST --> TICKET_DB
    
    NOTIFY --> CONFIRMATION
    PERSIST --> TICKETS
    NOTIFY --> NOTIFICATIONS
    
    USER_DB --> REPORTS
    EVENT_DB --> REPORTS
    BOOKING_DB --> REPORTS
    TICKET_DB --> REPORTS
    
    style VALIDATE fill:#ffebee
    style PROCESS fill:#e8f5e8
    style PERSIST fill:#e3f2fd
    style NOTIFY fill:#fff3e0
```

## 8. State Transition Diagrams

### Event Status States

```mermaid
stateDiagram-v2
    [*] --> Active: Create Event
    Active --> Cancelled: Cancel Event
    Active --> Completed: Event Date Passed
    Cancelled --> [*]: Delete Event
    Completed --> [*]: Archive Event
    
    note right of Active: Events can accept bookings
    note right of Cancelled: No new bookings allowed
    note right of Completed: Event has finished
```

### Booking Status States

```mermaid
stateDiagram-v2
    [*] --> Confirmed: Create Booking
    Confirmed --> Cancelled: Cancel Booking
    Cancelled --> [*]: Refund Processed
    
    note right of Confirmed: Tickets are active
    note right of Cancelled: Tickets are cancelled
```

### Ticket Status States

```mermaid
stateDiagram-v2
    [*] --> Active: Generate Ticket
    Active --> Used: Scan at Event
    Active --> Cancelled: Cancel Booking
    Used --> [*]: Event Completed
    Cancelled --> [*]: Booking Cancelled
    
    note right of Active: Ready for use
    note right of Used: Already scanned
    note right of Cancelled: Invalid ticket
```

## 9. Migration Process Flow

```mermaid
graph TB
    START([Start Migration])
    CHECK_DB{Database Connection OK?}
    CREATE_TABLE[Create Migration Tracking Table]
    READ_FILES[Read Migration Files]
    CHECK_APPLIED{Migration Already Applied?}
    SKIP[Skip Migration]
    APPLY[Apply Migration]
    MARK_APPLIED[Mark as Applied]
    ERROR[Handle Error]
    SUCCESS([Migration Complete])
    
    START --> CHECK_DB
    CHECK_DB -->|No| ERROR
    CHECK_DB -->|Yes| CREATE_TABLE
    CREATE_TABLE --> READ_FILES
    READ_FILES --> CHECK_APPLIED
    CHECK_APPLIED -->|Yes| SKIP
    CHECK_APPLIED -->|No| APPLY
    APPLY -->|Success| MARK_APPLIED
    APPLY -->|Error| ERROR
    MARK_APPLIED --> CHECK_APPLIED
    SKIP --> CHECK_APPLIED
    ERROR --> SUCCESS
    CHECK_APPLIED -->|All Done| SUCCESS
    
    style START fill:#e8f5e8
    style SUCCESS fill:#e8f5e8
    style ERROR fill:#ffebee
    style APPLY fill:#e3f2fd
```
