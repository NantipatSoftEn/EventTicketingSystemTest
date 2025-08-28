import { Injectable } from '@angular/core';
import { Observable, of, delay, map, catchError, BehaviorSubject } from 'rxjs';
import { Event, EventFilters, EventManagement } from '../models/event.model';
import { ApiService } from './api.service';
import { DevModeService } from './dev-mode.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private cachedEvents: Event[] = [];
  private eventsCache$ = new BehaviorSubject<Event[]>([]);
  private isCacheLoaded = false;
  private mockEvents: Event[] = [
    {
      id: 1,
      title: 'Summer Music Festival 2025',
      description: 'Join us for an unforgettable night of music featuring top artists from around the world. Experience live performances, food trucks, and an amazing atmosphere under the stars.',
      venue: 'Central Park Arena',
      date: new Date('2025-09-15'),
      time: '18:00',
      price: 75.00,
      totalTickets: 5000,
      availableTickets: 3250,
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
      isActive: true,
      createdAt: new Date('2025-01-15')
    },
    {
      id: 2,
      title: 'Tech Innovation Conference',
      description: 'Discover the latest trends in technology, AI, and innovation. Network with industry leaders and learn about cutting-edge developments shaping our future.',
      venue: 'Convention Center Downtown',
      date: new Date('2025-09-22'),
      time: '09:00',
      price: 150.00,
      totalTickets: 1000,
      availableTickets: 450,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      isActive: true,
      createdAt: new Date('2025-02-01')
    },
    {
      id: 3,
      title: 'Food & Wine Festival',
      description: 'Indulge in culinary delights from renowned chefs and sample premium wines from around the globe. A perfect weekend experience for food enthusiasts.',
      venue: 'Riverside Park',
      date: new Date('2025-09-28'),
      time: '12:00',
      price: 95.00,
      totalTickets: 2000,
      availableTickets: 1200,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      isActive: true,
      createdAt: new Date('2025-02-10')
    },
    {
      id: 4,
      title: 'Art Exhibition: Modern Masters',
      description: 'Explore contemporary art from emerging and established artists. Interactive installations, guided tours, and exclusive artist meet-and-greets.',
      venue: 'Metropolitan Art Gallery',
      date: new Date('2025-10-05'),
      time: '10:00',
      price: 25.00,
      totalTickets: 800,
      availableTickets: 600,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
      isActive: true,
      createdAt: new Date('2025-02-20')
    },
    {
      id: 5,
      title: 'Comedy Night Spectacular',
      description: 'Laugh until your sides hurt with our lineup of hilarious comedians. An evening of stand-up comedy, sketches, and interactive entertainment.',
      venue: 'Comedy Club Central',
      date: new Date('2025-10-12'),
      time: '20:00',
      price: 35.00,
      totalTickets: 300,
      availableTickets: 85,
      image: 'https://images.unsplash.com/photo-1585699933707-4b823080deb9?w=800&h=600&fit=crop',
      isActive: true,
      createdAt: new Date('2025-03-01')
    },
    {
      id: 6,
      title: 'Fitness & Wellness Expo',
      description: 'Discover the latest in fitness equipment, wellness programs, and healthy living. Free workout sessions, nutrition consultations, and product demos.',
      venue: 'Sports Complex Arena',
      date: new Date('2025-10-19'),
      time: '08:00',
      price: 20.00,
      totalTickets: 1500,
      availableTickets: 1100,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      isActive: true,
      createdAt: new Date('2025-03-10')
    }
  ];

  constructor(
    private apiService: ApiService,
    private devModeService: DevModeService
  ) {}

  getEvents(filters?: EventFilters): Observable<Event[]> {
    if (this.devModeService.isDevMode) {
      return this.getMockEvents(filters);
    } else {
      // If cache is not loaded, fetch from API first
      if (!this.isCacheLoaded) {
        return this.loadEventsFromApi().pipe(
          map(events => this.applyFilters(events, filters))
        );
      } else {
        // Use cached data and apply filters locally
        return of(this.applyFilters(this.cachedEvents, filters));
      }
    }
  }

  // Method to refresh events from API (can be called manually when needed)
  refreshEvents(): Observable<Event[]> {
    this.isCacheLoaded = false;
    this.cachedEvents = [];
    return this.loadEventsFromApi();
  }

  // Method to load events from API and cache them
  private loadEventsFromApi(): Observable<Event[]> {
    return this.apiService.getEvents().pipe(
      map(events => {
        this.cachedEvents = events.filter(event => event.isActive);
        this.eventsCache$.next(this.cachedEvents);
        this.isCacheLoaded = true;
        return this.cachedEvents;
      }),
      catchError(error => {
        console.error('Error fetching events from API:', error);
        // Fallback to mock data if API fails
        return this.getMockEvents();
      })
    );
  }

  // Method to apply filters to events array
  private applyFilters(events: Event[], filters?: EventFilters): Event[] {
    if (!filters) {
      return events;
    }

    let filteredEvents = [...events];
    console.log('Starting with', filteredEvents.length, 'events');

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.venue.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm)
      );
      console.log('After search filter:', filteredEvents.length, 'events');
    }

    if (filters.venue) {
      filteredEvents = filteredEvents.filter(event =>
        event.venue.toLowerCase().includes(filters.venue!.toLowerCase())
      );
      console.log('After venue filter:', filteredEvents.length, 'events');
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0); // Set to start of day
      console.log('Filtering events from date:', fromDate);
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
        const isAfterFrom = eventDate >= fromDate;
        console.log('Event:', event.title, 'Date:', eventDate, 'Is after from:', isAfterFrom);
        return isAfterFrom;
      });
      console.log('After dateFrom filter:', filteredEvents.length, 'events');
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Set to end of day
      console.log('Filtering events to date:', toDate);
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
        const isBeforeTo = eventDate <= toDate;
        console.log('Event:', event.title, 'Date:', eventDate, 'Is before to:', isBeforeTo);
        return isBeforeTo;
      });
      console.log('After dateTo filter:', filteredEvents.length, 'events');
    }

    return filteredEvents;
  }

  getEventById(id: string | number): Observable<Event | undefined> {
    console.log('getEventById called with:', id);

    // Handle invalid input
    if (id === null || id === undefined || id === '') {
      console.log('Invalid input, returning undefined');
      return of(undefined);
    }

    const eventId = typeof id === 'string' ? parseInt(id) : id;

    // Handle invalid conversion
    if (isNaN(eventId)) {
      console.log('Invalid eventId after conversion, returning undefined');
      return of(undefined);
    }

    console.log('Dev mode:', this.devModeService.isDevMode);

    if (this.devModeService.isDevMode) {
      console.log('Using mock data for event ID:', eventId);
      return this.getMockEventById(eventId);
    } else {
      console.log('Using API for event ID:', eventId);
      // First check if we have the event in cache
      if (this.isCacheLoaded) {
        const event = this.cachedEvents.find(e => e.id === eventId);
        if (event) {
          console.log('Found event in cache:', event);
          return of(event);
        }
      }
      // If not in cache or cache not loaded, fetch from API
      console.log('Fetching from API:', eventId.toString());
      return this.getApiEventById(eventId.toString());
    }
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt'>): Observable<Event> {
    if (this.devModeService.isDevMode) {
      return this.createMockEvent(event);
    } else {
      return this.apiService.createEvent(event);
    }
  }

  updateEvent(id: string | number, event: Partial<Event> & { status?: string }): Observable<Event | null> {
    const eventId = typeof id === 'string' ? parseInt(id) : id;

    if (this.devModeService.isDevMode) {
      return this.updateMockEvent(eventId, event);
    } else {
      //  change to patch to allow partial updates
      return  this.apiService.patchEvent(eventId.toString(), event).pipe(
        catchError(() => of(null))
      );
      // return this.apiService.updateEvent(eventId.toString(), event).pipe(
      //   catchError(() => of(null))
      // );
    }
  }

  getVenues(): Observable<string[]> {
    if (this.devModeService.isDevMode) {
      const venues = [...new Set(this.mockEvents.map(event => event.venue))];
      return of(venues);
    } else {
      // Use cached events if available
      if (this.isCacheLoaded) {
        const venues = [...new Set(this.cachedEvents.map(event => event.venue))];
        return of(venues);
      } else {
        // Load events first and then extract venues
        return this.loadEventsFromApi().pipe(
          map(events => [...new Set(events.map(event => event.venue))]),
          catchError(() => of([]))
        );
      }
    }
  }

  // Method to reduce available tickets (used during booking)
  reduceAvailableTickets(eventId: string | number, quantity: number): Observable<boolean> {
    const numericEventId = typeof eventId === 'string' ? parseInt(eventId) : eventId;

    if (this.devModeService.isDevMode) {
      const event = this.mockEvents.find(e => e.id === numericEventId);
      if (event && event.availableTickets >= quantity) {
        event.availableTickets -= quantity;
        return of(true).pipe(delay(300));
      }
      return of(false);
    } else {
      // Update cache if event exists
      const cachedEvent = this.cachedEvents.find(e => e.id === numericEventId);
      if (cachedEvent && cachedEvent.availableTickets >= quantity) {
        cachedEvent.availableTickets -= quantity;
        this.eventsCache$.next(this.cachedEvents);
      }
      // For API mode, this would typically involve a specific endpoint
      return of(true).pipe(delay(300));
    }
  }

  // Get cached events observable for real-time updates
  getCachedEvents(): Observable<Event[]> {
    return this.eventsCache$.asObservable();
  }

  // Private methods for mock data
  private getMockEvents(filters?: EventFilters): Observable<Event[]> {
    const activeEvents = this.mockEvents.filter(event => event.isActive);
    const filteredEvents = this.applyFilters(activeEvents, filters);
    return of(filteredEvents).pipe(delay(500)); // Simulate API delay
  }

  private getMockEventById(id: number): Observable<Event | undefined> {
    const event = this.mockEvents.find(e => e.id === id);
    return of(event).pipe(delay(300));
  }

  private createMockEvent(event: Omit<Event, 'id' | 'createdAt'>): Observable<Event> {
    const newEvent: Event = {
      ...event,
      id: this.mockEvents.length + 1,
      createdAt: new Date()
    };
    this.mockEvents.push(newEvent);
    return of(newEvent).pipe(delay(500));
  }

  private updateMockEvent(id: number, event: Partial<Event> & { status?: string }): Observable<Event | null> {
    const index = this.mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      const updatedEvent = { ...this.mockEvents[index], ...event };

      // Handle status update
      if (event.status) {
        updatedEvent.isActive = event.status === 'active';
      }

      this.mockEvents[index] = updatedEvent;
      return of(this.mockEvents[index]).pipe(delay(500));
    }
    return of(null);
  }

  // Private methods for API data (removed getApiEvents as it's replaced by loadEventsFromApi)

  private getApiEventById(id: string): Observable<Event | undefined> {
    return this.apiService.getEventById(id).pipe(
      map(event => event || undefined),
      catchError(error => {
        console.error('Error fetching event from API:', error);
        // Fallback to mock data if API fails
        return this.getMockEventById(parseInt(id));
      })
    );
  }

  // Get events with management statistics - optimized single API call
  getEventsForManagement(): Observable<EventManagement[]> {
    if (this.devModeService.isDevMode) {
      // For dev mode, transform mock data to management format
      return this.getMockEventsForManagement();
    } else {
      return this.apiService.getEventsForManagement().pipe(
        catchError(error => {
          console.error('Error fetching management events from API:', error);
          // Fallback to empty array on error
          return of([]);
        })
      );
    }
  }

  // Mock events for management (dev mode)
  private getMockEventsForManagement(): Observable<EventManagement[]> {
    const mockManagementData: EventManagement[] = [
      {
        id: 1,
        title: 'Summer Music Festival 2025',
        description: 'Join us for an unforgettable night of music featuring top artists from around the world.',
        venue: 'Central Park Arena',
        date_time: '2025-09-15T18:00:00Z',
        capacity: 5000,
        price: '75.00',
        status: 'active',
        created_at: '2025-01-15T00:00:00Z',
        total_tickets_sold: 1750,
        available_tickets: 3250,
        total_revenue: '131250.00',
        total_bookings: 875,
        occupancy_percentage: 35.0,
        potential_revenue: '375000.00'
      },
      {
        id: 2,
        title: 'Tech Innovation Conference',
        description: 'Discover the latest trends in technology, AI, and innovation.',
        venue: 'Convention Center Downtown',
        date_time: '2025-09-22T09:00:00Z',
        capacity: 1000,
        price: '150.00',
        status: 'active',
        created_at: '2025-02-01T00:00:00Z',
        total_tickets_sold: 550,
        available_tickets: 450,
        total_revenue: '82500.00',
        total_bookings: 275,
        occupancy_percentage: 55.0,
        potential_revenue: '150000.00'
      },
      {
        id: 3,
        title: 'Food & Wine Festival',
        description: 'Indulge in culinary delights from renowned chefs.',
        venue: 'Riverside Park',
        date_time: '2025-09-28T12:00:00Z',
        capacity: 2000,
        price: '95.00',
        status: 'active',
        created_at: '2025-02-15T00:00:00Z',
        total_tickets_sold: 1200,
        available_tickets: 800,
        total_revenue: '114000.00',
        total_bookings: 600,
        occupancy_percentage: 60.0,
        potential_revenue: '190000.00'
      }
    ];

    return of(mockManagementData).pipe(delay(500));
  }
}
