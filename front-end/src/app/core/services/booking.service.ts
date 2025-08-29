import { Injectable } from '@angular/core'
import { Observable, of, delay, map, throwError, catchError } from 'rxjs'
import {
    Booking,
    BookingRequest,
    BookingApiRequest,
    BookingStatus,
    Ticket,
    TicketStatus,
} from '../models/booking.model'
import { ApiService } from './api.service'
import { DevModeService } from './dev-mode.service'

@Injectable({
    providedIn: 'root',
})
export class BookingService {
    private mockBookings: Booking[] = [
        {
            id: '1',
            userId: 1,
            eventId: 1,
            quantity: 2,
            totalAmount: 150.0,
            status: BookingStatus.CONFIRMED,
            bookingDate: new Date('2025-08-15'),
            tickets: [
                {
                    id: 'ticket1',
                    bookingId: '1',
                    ticketCode: 'SUMMER2025-001',
                    status: TicketStatus.VALID,
                    createdAt: new Date('2025-08-15'),
                },
                {
                    id: 'ticket2',
                    bookingId: '1',
                    ticketCode: 'SUMMER2025-002',
                    status: TicketStatus.VALID,
                    createdAt: new Date('2025-08-15'),
                },
            ],
        },
        {
            id: '2',
            userId: 1,
            eventId: 2,
            quantity: 1,
            totalAmount: 150.0,
            status: BookingStatus.CONFIRMED,
            bookingDate: new Date('2025-08-10'),
            tickets: [
                {
                    id: 'ticket3',
                    bookingId: '2',
                    ticketCode: 'TECH2025-001',
                    status: TicketStatus.VALID,
                    createdAt: new Date('2025-08-10'),
                },
            ],
        },
        {
            id: '3',
            userId: 2,
            eventId: 3,
            quantity: 4,
            totalAmount: 380.0,
            status: BookingStatus.CONFIRMED,
            bookingDate: new Date('2025-08-12'),
            tickets: [
                {
                    id: 'ticket4',
                    bookingId: '3',
                    ticketCode: 'FOOD2025-001',
                    status: TicketStatus.VALID,
                    createdAt: new Date('2025-08-12'),
                },
                {
                    id: 'ticket5',
                    bookingId: '3',
                    ticketCode: 'FOOD2025-002',
                    status: TicketStatus.VALID,
                    createdAt: new Date('2025-08-12'),
                },
                {
                    id: 'ticket6',
                    bookingId: '3',
                    ticketCode: 'FOOD2025-003',
                    status: TicketStatus.VALID,
                    createdAt: new Date('2025-08-12'),
                },
                {
                    id: 'ticket7',
                    bookingId: '3',
                    ticketCode: 'FOOD2025-004',
                    status: TicketStatus.VALID,
                    createdAt: new Date('2025-08-12'),
                },
            ],
        },
    ]

    constructor(
        private apiService: ApiService,
        private devModeService: DevModeService
    ) {}

    createBooking(bookingRequest: BookingRequest): Observable<Booking> {
        if (this.devModeService.isDevMode) {
            return this.createMockBooking(bookingRequest)
        } else {
            return this.apiService.createBooking(bookingRequest).pipe(
                catchError(error => {
                    console.error('Error creating booking via API:', error)
                    return throwError(() => error)
                })
            )
        }
    }

    createBookingWithApiFormat(
        bookingRequest: BookingApiRequest
    ): Observable<Booking> {
        if (this.devModeService.isDevMode) {
            // Convert API format to internal format for mock
            const internalRequest: BookingRequest = {
                eventId: bookingRequest.event_id,
                userId: bookingRequest.user_id,
                quantity: bookingRequest.quantity,
                userName: 'Test User', // Default for API format
                userPhone: '',
            }
            return this.createMockBooking(internalRequest)
        } else {
            // Send the API format directly to the backend (don't transform to internal format)
            return this.apiService.createBooking(bookingRequest).pipe(
                catchError(error => {
                    console.error('Error creating booking via API:', error)
                    return throwError(() => error)
                })
            )
        }
    }

    getUserBookings(userId?: number): Observable<Booking[]> {
        if (this.devModeService.isDevMode) {
            return this.getMockUserBookings(userId)
        } else {
            if (!userId) {
                // For demo purposes, return empty array if no userId provided in API mode
                return of([])
            }
            return this.apiService.getUserBookings(userId.toString()).pipe(
                map(apiBookings =>
                    this.transformApiBookingsToFrontendFormat(apiBookings)
                ),
                catchError(error => {
                    console.error(
                        'Error fetching user bookings from API:',
                        error
                    )
                    return this.getMockUserBookings(userId) // Fallback to mock data
                })
            )
        }
    }

    private transformApiBookingsToFrontendFormat(
        apiBookings: any[]
    ): Booking[] {
        return apiBookings.map(apiBooking => ({
            id: apiBooking.id.toString(),
            userId: apiBooking.user_id,
            eventId: apiBooking.event_id,
            quantity: apiBooking.quantity,
            totalAmount: parseFloat(apiBooking.total_amount),
            status: this.mapApiStatusToFrontendStatus(apiBooking.status),
            bookingDate: new Date(apiBooking.booking_date),
            tickets:
                apiBooking.tickets?.map((ticket: any) => ({
                    id: ticket.id.toString(),
                    bookingId: ticket.booking_id.toString(),
                    ticketCode: ticket.ticket_code,
                    status: this.mapApiTicketStatusToFrontendStatus(
                        ticket.status
                    ),
                    createdAt: new Date(), // API doesn't provide created_at for tickets
                })) || [],
            // Store event data if provided by API
            event: apiBooking.event
                ? {
                      id: apiBooking.event.id,
                      title: apiBooking.event.title,
                      description: apiBooking.event.description,
                      venue: apiBooking.event.venue,
                      date: new Date(apiBooking.event.date_time),
                      time: new Date(
                          apiBooking.event.date_time
                      ).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                      }),
                      price: parseFloat(apiBooking.event.price),
                      totalTickets: apiBooking.event.capacity,
                      availableTickets: apiBooking.event.capacity, // API doesn't provide available tickets
                      image: '/assets/images/default-event.jpg', // Default image
                      isActive: apiBooking.event.status === 'active',
                      createdAt: new Date(apiBooking.event.created_at),
                  }
                : undefined,
        }))
    }

    private mapApiStatusToFrontendStatus(apiStatus: string): BookingStatus {
        switch (apiStatus.toLowerCase()) {
            case 'confirmed':
                return BookingStatus.CONFIRMED
            case 'cancelled':
                return BookingStatus.CANCELLED
            case 'pending':
                return BookingStatus.PENDING
            default:
                return BookingStatus.PENDING
        }
    }

    private mapApiTicketStatusToFrontendStatus(
        apiStatus: string
    ): TicketStatus {
        switch (apiStatus.toLowerCase()) {
            case 'active':
                return TicketStatus.VALID
            case 'used':
                return TicketStatus.USED
            case 'cancelled':
                return TicketStatus.CANCELLED
            default:
                return TicketStatus.VALID
        }
    }

    getBookingById(id: string): Observable<Booking | undefined> {
        if (this.devModeService.isDevMode) {
            return this.getMockBookingById(id)
        } else {
            return this.apiService.getBookingById(id).pipe(
                map(booking => booking || undefined),
                catchError(error => {
                    console.error('Error fetching booking from API:', error)
                    return this.getMockBookingById(id) // Fallback to mock data
                })
            )
        }
    }

    cancelBooking(bookingId: string): Observable<boolean> {
        if (this.devModeService.isDevMode) {
            return this.cancelMockBooking(bookingId)
        } else {
            return this.apiService
                .updateBookingStatus(bookingId, 'cancelled')
                .pipe(
                    map(() => true),
                    catchError(error => {
                        console.error(
                            'Error cancelling booking via API:',
                            error
                        )
                        return this.cancelMockBooking(bookingId) // Fallback to mock data
                    })
                )
        }
    }

    getEventBookings(eventId: number): Observable<Booking[]> {
        if (this.devModeService.isDevMode) {
            return this.getMockEventBookings(eventId)
        } else {
            return this.apiService.getEventBookings(eventId.toString()).pipe(
                catchError(error => {
                    console.error(
                        'Error fetching event bookings from API:',
                        error
                    )
                    return this.getMockEventBookings(eventId) // Fallback to mock data
                })
            )
        }
    }

    getBookingStats(
        eventId: number
    ): Observable<{
        totalBookings: number
        totalRevenue: number
        totalTickets: number
    }> {
        if (this.devModeService.isDevMode) {
            return this.getMockBookingStats(eventId)
        } else {
            return this.apiService.getBookingStats(eventId.toString()).pipe(
                catchError(error => {
                    console.error(
                        'Error fetching booking stats from API:',
                        error
                    )
                    return this.getMockBookingStats(eventId) // Fallback to mock data
                })
            )
        }
    }

    // Private methods for mock data
    private createMockBooking(
        bookingRequest: BookingRequest
    ): Observable<Booking> {
        // Create booking with the provided user data
        const newBooking: Booking = {
            id: (this.mockBookings.length + 1).toString(),
            userId: bookingRequest.userId, // Use the actual user ID from request
            eventId: bookingRequest.eventId,
            quantity: bookingRequest.quantity,
            totalAmount: 0, // Will be calculated based on event price
            status: BookingStatus.CONFIRMED,
            bookingDate: new Date(),
            tickets: this.generateTickets(
                bookingRequest.quantity,
                (this.mockBookings.length + 1).toString()
            ),
        }

        this.mockBookings.push(newBooking)
        return of(newBooking).pipe(delay(1000)) // Simulate API delay
    }

    private getMockUserBookings(userId?: number): Observable<Booking[]> {
        // For demo purposes, return all bookings if no userId provided
        const userBookings = userId
            ? this.mockBookings.filter(booking => booking.userId === userId)
            : this.mockBookings

        return of(userBookings).pipe(delay(500))
    }

    private getMockBookingById(id: string): Observable<Booking | undefined> {
        const booking = this.mockBookings.find(b => b.id === id)
        return of(booking).pipe(delay(300))
    }

    private cancelMockBooking(bookingId: string): Observable<boolean> {
        const booking = this.mockBookings.find(b => b.id === bookingId)
        if (booking && booking.status !== BookingStatus.CANCELLED) {
            booking.status = BookingStatus.CANCELLED
            booking.tickets.forEach(
                ticket => (ticket.status = TicketStatus.CANCELLED)
            )
            return of(true).pipe(delay(500))
        }
        return throwError(
            () => new Error('Booking not found or already cancelled')
        )
    }

    private getMockEventBookings(eventId: number): Observable<Booking[]> {
        const eventBookings = this.mockBookings.filter(
            booking => booking.eventId === eventId
        )
        return of(eventBookings).pipe(delay(500))
    }

    private getMockBookingStats(
        eventId: number
    ): Observable<{
        totalBookings: number
        totalRevenue: number
        totalTickets: number
    }> {
        const eventBookings = this.mockBookings.filter(
            booking =>
                booking.eventId === eventId &&
                booking.status === BookingStatus.CONFIRMED
        )

        const stats = {
            totalBookings: eventBookings.length,
            totalRevenue: eventBookings.reduce(
                (sum, booking) => sum + booking.totalAmount,
                0
            ),
            totalTickets: eventBookings.reduce(
                (sum, booking) => sum + booking.quantity,
                0
            ),
        }

        return of(stats).pipe(delay(300))
    }

    private generateTickets(quantity: number, bookingId: string): Ticket[] {
        const tickets: Ticket[] = []
        const eventCode = this.generateEventCode()

        for (let i = 1; i <= quantity; i++) {
            tickets.push({
                id: `ticket_${bookingId}_${i}`,
                bookingId: bookingId,
                ticketCode: `${eventCode}-${String(i).padStart(3, '0')}`,
                status: TicketStatus.VALID,
                createdAt: new Date(),
            })
        }

        return tickets
    }

    private generateEventCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }
}
