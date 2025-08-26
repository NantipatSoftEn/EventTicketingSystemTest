export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
  bookingDate: Date;
  tickets: Ticket[];
  event?: Event;
  user?: User;
}

export interface Ticket {
  id: string;
  bookingId: string;
  ticketCode: string;
  status: TicketStatus;
  createdAt: Date;
}

export interface BookingRequest {
  eventId: string;
  quantity: number;
  userEmail: string;
  userName: string;
  userPhone?: string;
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export enum TicketStatus {
  VALID = 'valid',
  USED = 'used',
  CANCELLED = 'cancelled'
}

// Import dependencies (will be added when Event and User models are created)
import { Event } from './event.model';
import { User } from './user.model';
