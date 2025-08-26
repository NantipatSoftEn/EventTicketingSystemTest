import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Event, EventFilters } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private mockEvents: Event[] = [
    {
      id: '1',
      title: 'Summer Music Festival 2025',
      description: 'Join us for an unforgettable night of music featuring top artists from around the world. Experience live performances, food trucks, and an amazing atmosphere under the stars.',
      venue: 'Central Park Arena',
      date: new Date('2025-09-15'),
      time: '18:00',
      price: 75.00,
      totalTickets: 5000,
      availableTickets: 3250,
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
      category: 'Music',
      isActive: true,
      createdAt: new Date('2025-01-15')
    },
    {
      id: '2',
      title: 'Tech Innovation Conference',
      description: 'Discover the latest trends in technology, AI, and innovation. Network with industry leaders and learn about cutting-edge developments shaping our future.',
      venue: 'Convention Center Downtown',
      date: new Date('2025-09-22'),
      time: '09:00',
      price: 150.00,
      totalTickets: 1000,
      availableTickets: 450,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      category: 'Technology',
      isActive: true,
      createdAt: new Date('2025-02-01')
    },
    {
      id: '3',
      title: 'Food & Wine Festival',
      description: 'Indulge in culinary delights from renowned chefs and sample premium wines from around the globe. A perfect weekend experience for food enthusiasts.',
      venue: 'Riverside Park',
      date: new Date('2025-09-28'),
      time: '12:00',
      price: 95.00,
      totalTickets: 2000,
      availableTickets: 1200,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      category: 'Food & Drink',
      isActive: true,
      createdAt: new Date('2025-02-10')
    },
    {
      id: '4',
      title: 'Art Exhibition: Modern Masters',
      description: 'Explore contemporary art from emerging and established artists. Interactive installations, guided tours, and exclusive artist meet-and-greets.',
      venue: 'Metropolitan Art Gallery',
      date: new Date('2025-10-05'),
      time: '10:00',
      price: 25.00,
      totalTickets: 800,
      availableTickets: 600,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
      category: 'Art',
      isActive: true,
      createdAt: new Date('2025-02-20')
    },
    {
      id: '5',
      title: 'Comedy Night Spectacular',
      description: 'Laugh until your sides hurt with our lineup of hilarious comedians. An evening of stand-up comedy, sketches, and interactive entertainment.',
      venue: 'Comedy Club Central',
      date: new Date('2025-10-12'),
      time: '20:00',
      price: 35.00,
      totalTickets: 300,
      availableTickets: 85,
      image: 'https://images.unsplash.com/photo-1585699933707-4b823080deb9?w=800&h=600&fit=crop',
      category: 'Comedy',
      isActive: true,
      createdAt: new Date('2025-03-01')
    },
    {
      id: '6',
      title: 'Fitness & Wellness Expo',
      description: 'Discover the latest in fitness equipment, wellness programs, and healthy living. Free workout sessions, nutrition consultations, and product demos.',
      venue: 'Sports Complex Arena',
      date: new Date('2025-10-19'),
      time: '08:00',
      price: 20.00,
      totalTickets: 1500,
      availableTickets: 1100,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      category: 'Sports & Fitness',
      isActive: true,
      createdAt: new Date('2025-03-10')
    }
  ];

  getEvents(filters?: EventFilters): Observable<Event[]> {
    let filteredEvents = this.mockEvents.filter(event => event.isActive);

    if (filters) {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredEvents = filteredEvents.filter(event =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.venue.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.venue) {
        filteredEvents = filteredEvents.filter(event =>
          event.venue.toLowerCase().includes(filters.venue!.toLowerCase())
        );
      }

      if (filters.category) {
        filteredEvents = filteredEvents.filter(event =>
          event.category === filters.category
        );
      }

      if (filters.dateFrom) {
        filteredEvents = filteredEvents.filter(event =>
          event.date >= filters.dateFrom!
        );
      }

      if (filters.dateTo) {
        filteredEvents = filteredEvents.filter(event =>
          event.date <= filters.dateTo!
        );
      }
    }

    return of(filteredEvents).pipe(delay(500)); // Simulate API delay
  }

  getEventById(id: string): Observable<Event | undefined> {
    const event = this.mockEvents.find(e => e.id === id);
    return of(event).pipe(delay(300));
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.mockEvents.map(event => event.category))];
    return of(categories);
  }

  getVenues(): Observable<string[]> {
    const venues = [...new Set(this.mockEvents.map(event => event.venue))];
    return of(venues);
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt'>): Observable<Event> {
    const newEvent: Event = {
      ...event,
      id: (this.mockEvents.length + 1).toString(),
      createdAt: new Date()
    };
    this.mockEvents.push(newEvent);
    return of(newEvent).pipe(delay(500));
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event | null> {
    const index = this.mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockEvents[index] = { ...this.mockEvents[index], ...event };
      return of(this.mockEvents[index]).pipe(delay(500));
    }
    return of(null);
  }

  // Method to reduce available tickets (used during booking)
  reduceAvailableTickets(eventId: string, quantity: number): Observable<boolean> {
    const event = this.mockEvents.find(e => e.id === eventId);
    if (event && event.availableTickets >= quantity) {
      event.availableTickets -= quantity;
      return of(true).pipe(delay(300));
    }
    return of(false);
  }
}
