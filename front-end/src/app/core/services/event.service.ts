import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Event,
  CreateEventRequest,
  EventSearchFilter,
  ApiResponse,
  PaginatedResponse
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(filter?: EventSearchFilter): Observable<ApiResponse<Event[]>> {
    let params = new HttpParams();

    if (filter?.query) {
      params = params.set('query', filter.query);
    }
    if (filter?.venue) {
      params = params.set('venue', filter.venue);
    }
    if (filter?.startDate) {
      params = params.set('startDate', filter.startDate.toISOString());
    }
    if (filter?.endDate) {
      params = params.set('endDate', filter.endDate.toISOString());
    }

    return this.http.get<ApiResponse<Event[]>>(this.apiUrl, { params });
  }

  getEvent(id: number): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: CreateEventRequest): Observable<ApiResponse<Event>> {
    return this.http.post<ApiResponse<Event>>(this.apiUrl, event);
  }

  updateEvent(id: number, event: Partial<Event>): Observable<ApiResponse<Event>> {
    return this.http.put<ApiResponse<Event>>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getEventBookings(eventId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${eventId}/bookings`);
  }
}
