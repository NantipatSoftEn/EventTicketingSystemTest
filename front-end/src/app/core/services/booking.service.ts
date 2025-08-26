import { Injectable } from '@angular/core';
import { Observable, of, delay, map, throwError } from 'rxjs';
import { Booking, BookingRequest, BookingStatus, Ticket, TicketStatus } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private mockBookings: Booking[] = [
    {
      id: '1',
      userId: 'user1',
      eventId: '1',
      quantity: 2,
      totalAmount: 150.00,
      status: BookingStatus.CONFIRMED,
      bookingDate: new Date('2025-08-15'),
      tickets: [
        {
          id: 'ticket1',
          bookingId: '1',
          ticketCode: 'SUMMER2025-001',
          status: TicketStatus.VALID,
          createdAt: new Date('2025-08-15')
        },
        {
          id: 'ticket2',
          bookingId: '1',
          ticketCode: 'SUMMER2025-002',
          status: TicketStatus.VALID,
          createdAt: new Date('2025-08-15')
        }
      ]
    },
    {
      id: '2',
      userId: 'user1',
      eventId: '2',
      quantity: 1,
      totalAmount: 150.00,
      status: BookingStatus.CONFIRMED,
      bookingDate: new Date('2025-08-10'),
      tickets: [
        {
          id: 'ticket3',
          bookingId: '2',
          ticketCode: 'TECH2025-001',
          status: TicketStatus.VALID,
          createdAt: new Date('2025-08-10')
        }
      ]
    },
    {
      id: '3',
      userId: 'user2',
      eventId: '3',
      quantity: 4,
      totalAmount: 380.00,
      status: BookingStatus.CONFIRMED,
      bookingDate: new Date('2025-08-12'),
      tickets: [
        {
          id: 'ticket4',
          bookingId: '3',
          ticketCode: 'FOOD2025-001',
          status: TicketStatus.VALID,
          createdAt: new Date('2025-08-12')
        },
        {
          id: 'ticket5',
          bookingId: '3',
          ticketCode: 'FOOD2025-002',
          status: TicketStatus.VALID,
          createdAt: new Date('2025-08-12')
        },
        {
          id: 'ticket6',
          bookingId: '3',
          ticketCode: 'FOOD2025-003',
          status: TicketStatus.VALID,
          createdAt: new Date('2025-08-12')
        },
        {
          id: 'ticket7',
          bookingId: '3',
          ticketCode: 'FOOD2025-004',
          status: TicketStatus.VALID,
          createdAt: new Date('2025-08-12')
        }
      ]
    }
  ];

  createBooking(bookingRequest: BookingRequest): Observable<Booking> {
    // Simulate booking creation
    const newBooking: Booking = {
      id: (this.mockBookings.length + 1).toString(),
      userId: 'current-user', // In real app, get from auth service
      eventId: bookingRequest.eventId,
      quantity: bookingRequest.quantity,
      totalAmount: 0, // Will be calculated based on event price
      status: BookingStatus.CONFIRMED,
      bookingDate: new Date(),
      tickets: this.generateTickets(bookingRequest.quantity, (this.mockBookings.length + 1).toString())
    };

    this.mockBookings.push(newBooking);
    return of(newBooking).pipe(delay(1000)); // Simulate API delay
  }

  getUserBookings(userId?: string): Observable<Booking[]> {
    // For demo purposes, return all bookings if no userId provided
    const userBookings = userId
      ? this.mockBookings.filter(booking => booking.userId === userId)
      : this.mockBookings;

    return of(userBookings).pipe(delay(500));
  }

  getBookingById(id: string): Observable<Booking | undefined> {
    const booking = this.mockBookings.find(b => b.id === id);
    return of(booking).pipe(delay(300));
  }

  cancelBooking(bookingId: string): Observable<boolean> {
    const booking = this.mockBookings.find(b => b.id === bookingId);
    if (booking && booking.status !== BookingStatus.CANCELLED) {
      booking.status = BookingStatus.CANCELLED;
      booking.tickets.forEach(ticket => ticket.status = TicketStatus.CANCELLED);
      return of(true).pipe(delay(500));
    }
    return throwError(() => new Error('Booking not found or already cancelled'));
  }

  getEventBookings(eventId: string): Observable<Booking[]> {
    const eventBookings = this.mockBookings.filter(booking => booking.eventId === eventId);
    return of(eventBookings).pipe(delay(500));
  }

  getBookingStats(eventId: string): Observable<{totalBookings: number, totalRevenue: number, totalTickets: number}> {
    const eventBookings = this.mockBookings.filter(booking =>
      booking.eventId === eventId && booking.status === BookingStatus.CONFIRMED
    );

    const stats = {
      totalBookings: eventBookings.length,
      totalRevenue: eventBookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
      totalTickets: eventBookings.reduce((sum, booking) => sum + booking.quantity, 0)
    };

    return of(stats).pipe(delay(300));
  }

  private generateTickets(quantity: number, bookingId: string): Ticket[] {
    const tickets: Ticket[] = [];
    const eventCode = this.generateEventCode();

    for (let i = 1; i <= quantity; i++) {
      tickets.push({
        id: `ticket_${bookingId}_${i}`,
        bookingId: bookingId,
        ticketCode: `${eventCode}-${String(i).padStart(3, '0')}`,
        status: TicketStatus.VALID,
        createdAt: new Date()
      });
    }

    return tickets;
  }

  private generateEventCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
