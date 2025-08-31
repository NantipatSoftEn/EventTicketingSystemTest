export interface TicketValidationRequest {
  ticket_code: string;
}

export interface TicketValidationResponse {
  ticket_code: string;
  status: 'active' | 'used' | 'cancelled';
  is_valid: boolean;
  message: string;
  booking_id?: number;
  event_name?: string;
  event_date?: string;
  user_name?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
