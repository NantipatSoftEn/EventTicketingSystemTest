import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import {
    Booking,
    BookingStatus,
    TicketStatus,
} from '../../core/models/booking.model'
import { Event } from '../../core/models/event.model'
import {
    BookingService,
    EventService,
    AuthService,
    User as UserServiceUser,
} from '../../core/services'
import { UserSelectorComponent } from '../../shared/components/user-selector/user-selector.component'
import { forkJoin } from 'rxjs'

@Component({
    selector: 'app-user-dashboard',
    imports: [CommonModule, RouterLink, UserSelectorComponent],
    templateUrl: './user-dashboard.component.html',
    styleUrl: './user-dashboard.component.css',
})
export class UserDashboardComponent implements OnInit {
    bookings: Booking[] = []
    events: { [eventId: string]: Event } = {}
    isLoading = false
    selectedUser: UserServiceUser | null = null

    constructor(
        private bookingService: BookingService,
        private eventService: EventService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        // Don't load bookings initially, wait for user selection
    }

    onUserSelected(user: UserServiceUser | null): void {
        this.selectedUser = user
        if (user) {
            this.loadUserBookings(user.id)
        } else {
            this.bookings = []
            this.events = {}
        }
    }

    loadUserBookings(userId?: number): void {
        this.isLoading = true
        console.log('Loading bookings for user ID:', userId)

        this.bookingService.getUserBookings(userId).subscribe({
            next: bookings => {
                this.bookings = bookings
                console.log('Received bookings:', this.bookings)
                // Since API bookings already include event data, populate events cache directly
                this.populateEventsFromBookings(bookings)
                this.isLoading = false
            },
            error: error => {
                console.error('Error loading bookings:', error)
                this.isLoading = false
            },
        })
    }

    populateEventsFromBookings(bookings: Booking[]): void {
        console.log('Populating events from bookings:', bookings)
        bookings.forEach(booking => {
            if (booking.event) {
                console.log(
                    'Adding event to cache:',
                    booking.event.id,
                    booking.event.title
                )
                this.events[booking.eventId] = booking.event
            }
        })
        console.log('Final events cache:', this.events)
    }

    loadEventDetails(bookings: Booking[]): void {
        console.log('Loading event details for bookings:', bookings)

        const eventIds = [
            ...new Set(
                bookings
                    .map(booking => booking.eventId)
                    .filter(
                        id =>
                            id !== null &&
                            id !== undefined &&
                            !isNaN(Number(id))
                    )
            ),
        ]

        console.log('Event IDs to load:', eventIds)

        if (eventIds.length === 0) {
            console.log('No valid event IDs found')
            this.isLoading = false
            return
        }

        const eventRequests = eventIds.map(id => {
            console.log('Creating request for event ID:', id)
            return this.eventService.getEventById(id)
        })

        forkJoin(eventRequests).subscribe({
            next: events => {
                console.log('Received events:', events)
                events.forEach(event => {
                    if (event) {
                        console.log(
                            'Adding event to cache:',
                            event.id,
                            event.title
                        )
                        this.events[event.id] = event
                    }
                })
                console.log('Final events cache:', this.events)
                this.isLoading = false
            },
            error: error => {
                console.error('Error loading event details:', error)
                this.isLoading = false
            },
        })
    }

    cancelBooking(bookingId: string): void {
        if (confirm('Are you sure you want to cancel this booking?')) {
            this.bookingService.cancelBooking(bookingId).subscribe({
                next: () => {
                    // Update the booking status in the local array
                    const booking = this.bookings.find(b => b.id === bookingId)
                    if (booking) {
                        booking.status = BookingStatus.CANCELLED
                        booking.tickets.forEach(
                            ticket => (ticket.status = TicketStatus.CANCELLED)
                        )
                    }
                },
                error: error => {
                    console.error('Error canceling booking:', error)
                    alert('Failed to cancel booking. Please try again.')
                },
            })
        }
    }

    getBookingStatusClass(status: BookingStatus): string {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'bg-green-100 text-green-800'
            case BookingStatus.CANCELLED:
                return 'bg-red-100 text-red-800'
            case BookingStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    getTicketStatusClass(status: TicketStatus): string {
        switch (status) {
            case TicketStatus.VALID:
                return 'bg-green-100 text-green-800'
            case TicketStatus.USED:
                return 'bg-blue-100 text-blue-800'
            case TicketStatus.CANCELLED:
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    formatDateTime(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    formatPrice(price: number): string {
        if (isNaN(price) || price === null || price === undefined) {
            return '$0.00'
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price)
    }

    isEventPast(eventDate: Date): boolean {
        return new Date(eventDate) < new Date()
    }

    canCancelBooking(booking: Booking): boolean {
        if (booking.status !== BookingStatus.CONFIRMED) {
            return false
        }

        const event = this.events[booking.eventId]
        if (!event) {
            return false
        }

        // Can cancel if event is more than 24 hours away
        const eventDateTime = new Date(event.date)
        const now = new Date()
        const hoursDifference =
            (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        return hoursDifference > 24
    }

    getTotalSpent(): number {
        return this.bookings
            .filter(booking => booking.status === BookingStatus.CONFIRMED)
            .reduce((total, booking) => {
                const amount = booking.totalAmount || 0
                return total + (isNaN(amount) ? 0 : amount)
            }, 0)
    }

    getUpcomingEventsCount(): number {
        return this.bookings.filter(booking => {
            if (booking.status !== BookingStatus.CONFIRMED) return false
            const event = this.events[booking.eventId]
            return event && !this.isEventPast(event.date)
        }).length
    }

    getCompletedEventsCount(): number {
        return this.bookings.filter(booking => {
            if (booking.status !== BookingStatus.CONFIRMED) return false
            const event = this.events[booking.eventId]
            return event && this.isEventPast(event.date)
        }).length
    }

    getEventForBooking(booking: Booking): Event | null {
        return this.events[booking.eventId] || null
    }

    getEventTitle(booking: Booking): string {
        const event = this.getEventForBooking(booking)
        return event ? event.title : 'Event Details Loading...'
    }

    getEventPrice(booking: Booking): number {
        const event = this.getEventForBooking(booking)
        return event ? event.price : 0
    }
}
