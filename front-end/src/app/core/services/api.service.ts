import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event, EventFilters } from '../models/event.model';

// API Response interface based on the standardized format
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Generic method to handle API responses
  private handleResponse<T>(response: Observable<ApiResponse<T>>): Observable<T> {
    return response.pipe(
      map((res: ApiResponse<T>) => {
        if (res.success) {
          return res.data;
        } else {
          throw new Error(res.message);
        }
      })
    );
  }

  // Event-related API calls
  getEvents(filters?: EventFilters): Observable<Event[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.venue) params = params.set('venue', filters.venue);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo.toISOString());
    }

    return this.handleResponse(
      this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/events`, { params })
    ).pipe(
      map(apiEvents => apiEvents.map(this.transformApiEventToFrontend))
    );
  }

  getEventById(id: string): Observable<Event> {
    return this.handleResponse(
      this.http.get<ApiResponse<any>>(`${this.baseUrl}/events/${id}`)
    ).pipe(
      map(apiEvent => this.transformApiEventToFrontend(apiEvent))
    );
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt'>): Observable<Event> {
    const apiEvent = this.transformFrontendEventToApi(event);
    return this.handleResponse(
      this.http.post<ApiResponse<any>>(`${this.baseUrl}/events`, apiEvent)
    ).pipe(
      map(apiEvent => this.transformApiEventToFrontend(apiEvent))
    );
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    const apiEvent = this.transformFrontendEventToApi(event);
    return this.handleResponse(
      this.http.put<ApiResponse<any>>(`${this.baseUrl}/events/${id}`, apiEvent)
    ).pipe(
      map(apiEvent => this.transformApiEventToFrontend(apiEvent))
    );
  }

  // Transform API event data to frontend Event model
  private transformApiEventToFrontend(apiEvent: any): Event {
    return {
      id: apiEvent.id.toString(),
      title: apiEvent.title,
      description: apiEvent.description,
      venue: apiEvent.venue,
      date: new Date(apiEvent.date_time),
      time: new Date(apiEvent.date_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      price: parseFloat(apiEvent.price),
      totalTickets: apiEvent.capacity,
      availableTickets: apiEvent.capacity, // Backend doesn't track available tickets separately
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop', // Default image
      category: 'General', // Default category if not provided
      isActive: apiEvent.status === 'active',
      createdAt: new Date(apiEvent.created_at)
    };
  }

  // Transform frontend Event model to API format
  private transformFrontendEventToApi(event: Partial<Event>): any {
    const apiEvent: any = {};

    if (event.title) apiEvent.title = event.title;
    if (event.description) apiEvent.description = event.description;
    if (event.venue) apiEvent.venue = event.venue;
    if (event.date && event.time) {
      const [hours, minutes] = event.time.split(':');
      const dateTime = new Date(event.date);
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      apiEvent.date_time = dateTime.toISOString();
    }
    if (event.totalTickets) apiEvent.capacity = event.totalTickets;
    if (event.price) apiEvent.price = event.price.toString();
    if (event.isActive !== undefined) apiEvent.status = event.isActive ? 'active' : 'inactive';

    return apiEvent;
  }

  // User-related API calls
  getUsers(): Observable<any[]> {
    return this.handleResponse(
      this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/users`)
    );
  }

  getUserById(id: string): Observable<any> {
    return this.handleResponse(
      this.http.get<ApiResponse<any>>(`${this.baseUrl}/users/${id}`)
    );
  }

  createUser(user: any): Observable<any> {
    return this.handleResponse(
      this.http.post<ApiResponse<any>>(`${this.baseUrl}/users`, user)
    );
  }

  // Booking-related API calls
  createBooking(booking: any): Observable<any> {
    return this.handleResponse(
      this.http.post<ApiResponse<any>>(`${this.baseUrl}/bookings`, booking)
    );
  }

  getUserBookings(userId: string): Observable<any[]> {
    return this.handleResponse(
      this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/bookings/user/${userId}`)
    );
  }

  getEventBookings(eventId: string): Observable<any[]> {
    return this.handleResponse(
      this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/bookings/event/${eventId}`)
    );
  }

  updateBookingStatus(bookingId: string, status: string): Observable<any> {
    return this.handleResponse(
      this.http.put<ApiResponse<any>>(`${this.baseUrl}/bookings/${bookingId}/status`, { status })
    );
  }
}
