# Real-Time Ticket Availability System

## Overview

This system provides real-time ticket availability updates to prevent users from attempting to book sold-out events and to show live availability status across the application.

## Features

### 🔄 Real-Time Updates
- **Polling**: Automatically polls for availability every 10 seconds
- **Live Status**: Shows "LIVE" indicator when polling is active
- **Immediate Updates**: Refreshes immediately after successful bookings

### 🎯 Sold-Out Prevention
- **Automatic Validation**: Prevents booking when tickets are sold out
- **Dynamic Limits**: Updates quantity limits based on real availability
- **UI Feedback**: Disables controls and shows clear messages

### 📊 Status Indicators
- **Sold Out**: Red badge when no tickets available
- **Almost Sold Out**: Orange badge when ≤10% remaining  
- **Limited Availability**: Yellow badge when ≤25% remaining
- **Available**: Green badge when >25% remaining

## Architecture

### Backend Components

#### 1. Event Availability Use Cases
```typescript
class EventAvailabilityUseCases {
  async getEventAvailability(eventId: int): EventAvailabilityDTO
  async getMultipleEventsAvailability(eventIds: List<int>): Dict<int, EventAvailabilityDTO>
  async getAllActiveEventsAvailability(): Dict<int, EventAvailabilityDTO>
}
```

#### 2. API Endpoints
- `GET /api/v1/availability/{event_id}` - Single event availability
- `GET /api/v1/availability?event_ids=1,2,3` - Multiple events
- `GET /api/v1/availability/all/active` - All active events

#### 3. Data Transfer Objects
```typescript
interface EventAvailabilityDTO {
  event_id: number;
  total_capacity: number;
  booked_tickets: number;
  available_tickets: number;
  occupancy_percentage: number;
  is_sold_out: boolean;
  is_almost_sold_out: boolean;
  event_status: string;
  last_updated: Date;
}
```

### Frontend Components

#### 1. Ticket Availability Service
```typescript
class TicketAvailabilityService {
  // Track specific events for real-time updates
  trackEvents(eventIds: number[]): void
  
  // Get availability observable for an event
  getEventAvailability(eventId: number): Observable<TicketAvailability>
  
  // Get status with UI classes
  getAvailabilityStatus(eventId: number): Observable<{text: string, class: string, disabled: boolean}>
  
  // Check if sold out
  isEventSoldOut(eventId: number): Observable<boolean>
  
  // Force refresh
  refreshAvailability(): void
}
```

#### 2. Real-Time Availability Component
```html
<app-real-time-availability 
  [eventId]="event.id"
  [fallbackAvailable]="event.availableTickets"
  [fallbackTotal]="event.totalTickets">
</app-real-time-availability>
```

## Usage Examples

### 1. Event Detail Page
```typescript
export class EventDetailComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    // Start tracking this event
    this.availabilityService.trackEvents([this.eventId]);
    
    // Subscribe to real-time updates
    this.availability$ = this.availabilityService.getEventAvailability(this.eventId);
    this.availabilityStatus$ = this.availabilityService.getAvailabilityStatus(this.eventId);
  }
  
  ngOnDestroy(): void {
    // Stop tracking when leaving page
    this.availabilityService.stopTrackingEvent(this.eventId);
  }
}
```

### 2. Event List Page
```typescript
export class EventListComponent implements OnInit {
  ngOnInit(): void {
    this.eventService.getEvents().subscribe(events => {
      // Track all events for live updates
      const eventIds = events.map(e => e.id);
      this.availabilityService.trackEvents(eventIds);
    });
  }
}
```

### 3. Template Usage
```html
<!-- Show real-time status -->
<div *ngIf="availabilityStatus$ | async as status" 
     [class]="'px-2 py-1 rounded-full text-xs font-medium ' + status.class">
  {{ status.text }}
</div>

<!-- Disable booking when sold out -->
<button [disabled]="(availabilityStatus$ | async)?.disabled"
        type="submit">
  <span *ngIf="(availabilityStatus$ | async)?.disabled">
    {{ (availabilityStatus$ | async)?.text }}
  </span>
  <span *ngIf="!(availabilityStatus$ | async)?.disabled">
    Book Now
  </span>
</button>

<!-- Dynamic quantity limits -->
<input type="number" 
       [max]="(availability$ | async)?.availableTickets || event.availableTickets"
       [disabled]="(availabilityStatus$ | async)?.disabled">
```

## Configuration

### Polling Intervals
```typescript
// In TicketAvailabilityService
private readonly POLLING_INTERVAL = 10000; // 10 seconds
private readonly SOLD_OUT_POLLING_INTERVAL = 5000; // 5 seconds for sold out events
```

### Availability Thresholds
```typescript
// In EventAvailabilityUseCases
is_almost_sold_out: available_tickets <= (event.capacity * 0.1)  // 10% threshold
```

## Error Handling

### Backend Errors
- Invalid event IDs are skipped silently
- Database errors return 500 with clear messages
- Missing events return 404

### Frontend Errors
- API failures fall back to cached/static data
- Network errors don't stop the application
- Failed requests are retried on next polling cycle

## Performance Optimizations

### Backend
- Efficient SQL queries with proper indexes
- Batch operations for multiple events
- Cached calculations where appropriate

### Frontend
- Debounced polling to prevent API spam
- Selective tracking (only active events)
- Automatic cleanup on component destruction
- Efficient RxJS operators for state management

## Browser Support

- **Polling**: Works in all modern browsers
- **Observables**: RxJS provides full compatibility
- **Real-time**: No WebSocket dependency (works behind firewalls)

## Testing

### Backend Tests
```bash
# Test availability endpoints
curl -X GET "http://localhost:8000/api/v1/availability/1"
curl -X GET "http://localhost:8000/api/v1/availability?event_ids=1,2,3"
curl -X GET "http://localhost:8000/api/v1/availability/all/active"
```

### Frontend Tests
- Unit tests for TicketAvailabilityService
- Integration tests for component interactions
- E2E tests for sold-out scenarios

## Troubleshooting

### Common Issues

1. **Polling not starting**
   - Check if `trackEvents()` was called
   - Verify event IDs are valid numbers

2. **Stale data**
   - Call `refreshAvailability()` to force update
   - Check network connection

3. **High API usage**
   - Verify polling intervals are reasonable
   - Check if components properly clean up

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('ticket-availability-debug', 'true');
```

## Future Enhancements

1. **WebSocket Support**: Real-time push updates
2. **Offline Mode**: Cache availability for offline use
3. **Adaptive Polling**: Slower polling for stable events
4. **Push Notifications**: Alert users of availability changes
5. **Analytics**: Track user behavior around sold-out events
