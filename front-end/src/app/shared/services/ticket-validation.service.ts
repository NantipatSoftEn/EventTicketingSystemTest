import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TicketValidationRequest,
  TicketValidationResponse,
  ApiResponse
} from '../models/ticket-validation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketValidationService {
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) { }

  /**
   * Validate a ticket by its code
   */
  validateTicket(request: TicketValidationRequest): Observable<ApiResponse<TicketValidationResponse>> {
    return this.http.post<ApiResponse<TicketValidationResponse>>(
      `${this.apiUrl}/validate`,
      request
    );
  }

  /**
   * Use a ticket (mark as used)
   */
  useTicket(ticketCode: string): Observable<ApiResponse<TicketValidationResponse>> {
    return this.http.post<ApiResponse<TicketValidationResponse>>(
      `${this.apiUrl}/use`,
      { ticket_code: ticketCode }
    );
  }
}
