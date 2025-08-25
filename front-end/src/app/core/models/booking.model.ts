export interface Booking {
  id: number;
  userId: number;
  eventId: number;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  bookingCode: string;
  createdAt: Date;
  event?: Event;
  tickets?: Ticket[];
}

export interface Ticket {
  id: number;
  bookingId: number;
  ticketCode: string;
  status: TicketStatus;
  createdAt: Date;
}

export interface CreateBookingRequest {
  eventId: number;
  quantity: number;
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING'
}

export enum TicketStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  CANCELLED = 'CANCELLED'
}

import { Event } from './event.model';
