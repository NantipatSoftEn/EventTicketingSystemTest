import { Injectable } from '@angular/core';
import { Observable, timer, BehaviorSubject, of, EMPTY } from 'rxjs';
import { switchMap, catchError, tap, distinctUntilChanged, filter } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DevModeService } from './dev-mode.service';

export interface TicketAvailability {
  eventId: number;
  totalCapacity: number;
  bookedTickets: number;
  availableTickets: number;
  occupancyPercentage: number;
  isSoldOut: boolean;
  isAlmostSoldOut: boolean;
  eventStatus: string;
  lastUpdated: Date;
}

export interface AvailabilityResponse {
  events: { [eventId: number]: TicketAvailability };
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TicketAvailabilityService {
  private readonly POLLING_INTERVAL = 10000; // 10 seconds
  private readonly SOLD_OUT_POLLING_INTERVAL = 5000; // 5 seconds for sold out events

  private availabilitySubject = new BehaviorSubject<{ [eventId: number]: TicketAvailability }>({});
  private isPollingSubject = new BehaviorSubject<boolean>(false);
  private trackedEventIds = new Set<number>();
  private pollingSubscription: any;

  public availability$ = this.availabilitySubject.asObservable();
  public isPolling$ = this.isPollingSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private devModeService: DevModeService
  ) {}

  /**
   * Start tracking availability for specific events
   */
  trackEvents(eventIds: number[]): void {
    eventIds.forEach(id => this.trackedEventIds.add(id));
    this.startPolling();
  }

  /**
   * Stop tracking a specific event
   */
  stopTrackingEvent(eventId: number): void {
    this.trackedEventIds.delete(eventId);

    // Remove from current availability
    const current = this.availabilitySubject.value;
    delete current[eventId];
    this.availabilitySubject.next(current);

    // Stop polling if no events to track
    if (this.trackedEventIds.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * Get availability for a specific event
   */
  getEventAvailability(eventId: number): Observable<TicketAvailability | null> {
    return this.availability$.pipe(
      distinctUntilChanged(),
      filter(availability => availability.hasOwnProperty(eventId) || Object.keys(availability).length === 0),
      switchMap(availability => of(availability[eventId] || null))
    );
  }

  /**
   * Force refresh availability for all tracked events
   */
  refreshAvailability(): void {
    if (this.trackedEventIds.size > 0) {
      this.fetchAvailability();
    }
  }

  /**
   * Check if an event is sold out
   */
  isEventSoldOut(eventId: number): Observable<boolean> {
    return this.getEventAvailability(eventId).pipe(
      switchMap(availability => of(availability?.isSoldOut || false))
    );
  }

  /**
   * Check if an event is almost sold out
   */
  isEventAlmostSoldOut(eventId: number): Observable<boolean> {
    return this.getEventAvailability(eventId).pipe(
      switchMap(availability => of(availability?.isAlmostSoldOut || false))
    );
  }

  /**
   * Get availability status text and class for UI
   */
  getAvailabilityStatus(eventId: number): Observable<{ text: string; class: string; disabled: boolean }> {
    return this.getEventAvailability(eventId).pipe(
      switchMap(availability => {
        if (!availability) {
          return of({ text: 'Loading...', class: 'text-gray-500', disabled: true });
        }

        if (availability.isSoldOut) {
          return of({ text: 'Sold Out', class: 'text-red-600 bg-red-100', disabled: true });
        } else if (availability.isAlmostSoldOut) {
          return of({ text: 'Almost Sold Out', class: 'text-orange-600 bg-orange-100', disabled: false });
        } else if (availability.occupancyPercentage >= 75) {
          return of({ text: 'Limited Availability', class: 'text-yellow-600 bg-yellow-100', disabled: false });
        } else {
          return of({ text: 'Available', class: 'text-green-600 bg-green-100', disabled: false });
        }
      })
    );
  }

  /**
   * Start polling for availability updates
   */
  private startPolling(): void {
    if (this.isPollingSubject.value) {
      return; // Already polling
    }

    this.isPollingSubject.next(true);

    // Initial fetch
    this.fetchAvailability();

    // Set up polling interval
    this.pollingSubscription = timer(this.POLLING_INTERVAL, this.POLLING_INTERVAL)
      .subscribe(() => {
        this.fetchAvailability();
      });
  }

  /**
   * Stop polling for availability updates
   */
  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    this.isPollingSubject.next(false);
  }

  /**
   * Fetch availability from API or mock data
   */
  private fetchAvailability(): void {
    if (this.trackedEventIds.size === 0) {
      return;
    }

    const eventIds = Array.from(this.trackedEventIds);

    if (this.devModeService.isDevMode) {
      this.fetchMockAvailability(eventIds);
    } else {
      this.fetchApiAvailability(eventIds);
    }
  }

  /**
   * Fetch availability from API
   */
  private fetchApiAvailability(eventIds: number[]): void {
    this.apiService.getMultipleEventsAvailability(eventIds).pipe(
      catchError(error => {
        console.error('Error fetching availability from API:', error);
        return of(null);
      })
    ).subscribe((response: any) => {
      if (response?.events) {
        const availability: { [eventId: number]: TicketAvailability } = {};

        Object.keys(response.events).forEach(eventIdStr => {
          const eventId = parseInt(eventIdStr);
          const eventData = response.events[eventId];

          availability[eventId] = {
            eventId: eventData.event_id,
            totalCapacity: eventData.total_capacity,
            bookedTickets: eventData.booked_tickets,
            availableTickets: eventData.available_tickets,
            occupancyPercentage: eventData.occupancy_percentage,
            isSoldOut: eventData.is_sold_out,
            isAlmostSoldOut: eventData.is_almost_sold_out,
            eventStatus: eventData.event_status,
            lastUpdated: new Date(eventData.last_updated || Date.now())
          };
        });

        this.availabilitySubject.next(availability);
      }
    });
  }

  /**
   * Generate mock availability data for development
   */
  private fetchMockAvailability(eventIds: number[]): void {
    const availability: { [eventId: number]: TicketAvailability } = {};

    eventIds.forEach(eventId => {
      // Simulate varying availability based on eventId
      const baseCapacity = 1000 + (eventId * 500);
      const randomBookedPercentage = 0.1 + (Math.random() * 0.8); // 10% to 90%
      const bookedTickets = Math.floor(baseCapacity * randomBookedPercentage);

      availability[eventId] = {
        eventId,
        totalCapacity: baseCapacity,
        bookedTickets,
        availableTickets: baseCapacity - bookedTickets,
        occupancyPercentage: randomBookedPercentage * 100,
        isSoldOut: randomBookedPercentage >= 1.0,
        isAlmostSoldOut: randomBookedPercentage >= 0.9,
        eventStatus: 'active',
        lastUpdated: new Date()
      };
    });

    this.availabilitySubject.next(availability);
  }

  /**
   * Clean up when service is destroyed
   */
  ngOnDestroy(): void {
    this.stopPolling();
    this.trackedEventIds.clear();
  }
}
