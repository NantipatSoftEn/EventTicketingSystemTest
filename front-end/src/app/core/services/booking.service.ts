import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Booking,
  CreateBookingRequest,
  ApiResponse
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(booking: CreateBookingRequest): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(this.apiUrl, booking);
  }

  getUserBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.apiUrl}/user`);
  }

  getBooking(id: number): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.apiUrl}/${id}`);
  }

  cancelBooking(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getAllBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(this.apiUrl);
  }
}
