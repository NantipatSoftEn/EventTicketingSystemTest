import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject, Observable } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { Event } from '../../core/models/event.model'
import {
    BookingRequest,
    BookingApiRequest,
} from '../../core/models/booking.model'
import { User } from '../../core/models/user.model'
import {
    EventService,
    BookingService,
    AuthService,
    TicketAvailabilityService,
    TicketAvailability,
    User as UserServiceUser,
} from '../../core/services'
import { UserSelectorComponent } from '../../shared/components/user-selector/user-selector.component'

@Component({
    selector: 'app-event-detail',
    imports: [CommonModule, FormsModule, UserSelectorComponent],
    templateUrl: './event-detail.component.html',
    styleUrl: './event-detail.component.css',
})
export class EventDetailComponent implements OnInit, OnDestroy {
    @ViewChild(UserSelectorComponent) userSelector!: UserSelectorComponent

    private destroy$ = new Subject<void>()

    event: Event | null = null
    isLoading = false
    isBooking = false
    bookingSuccess = false
    bookingError: string | null = null

    // Real-time availability data
    availability$: Observable<TicketAvailability | null>
    availabilityStatus$: Observable<{
        text: string
        class: string
        disabled: boolean
    }>
    isPollingAvailability$: Observable<boolean>
    currentAvailability: TicketAvailability | null = null

    bookingForm = {
        quantity: 1,
        userName: '',
        userPhone: '',
    }
    currentUser: User | null = null
    selectedTestUser: UserServiceUser | null = null

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventService: EventService,
        private bookingService: BookingService,
        private authService: AuthService,
        private availabilityService: TicketAvailabilityService
    ) {
        // Initialize observables
        this.availability$ = new Observable()
        this.availabilityStatus$ = new Observable()
        this.isPollingAvailability$ = this.availabilityService.isPolling$
    }

    ngOnInit(): void {
        const eventId = this.route.snapshot.params['id']
        if (eventId) {
            this.loadEvent(eventId)
            this.setupAvailabilityTracking(parseInt(eventId))
        }

        // Initialize form with empty values - will be filled by user selector
        this.bookingForm.userName = ''
        this.bookingForm.userPhone = ''
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()

        // Stop tracking this event when component is destroyed
        if (this.event) {
            this.availabilityService.stopTrackingEvent(this.event.id)
        }
    }

    setupAvailabilityTracking(eventId: number): void {
        // Start tracking availability for this event
        this.availabilityService.trackEvents([eventId])

        // Set up observables for real-time updates
        this.availability$ =
            this.availabilityService.getEventAvailability(eventId)
        this.availabilityStatus$ =
            this.availabilityService.getAvailabilityStatus(eventId)

        // Subscribe to availability changes to update local event data
        this.availability$
            .pipe(takeUntil(this.destroy$))
            .subscribe(availability => {
                this.currentAvailability = availability
                if (availability && this.event) {
                    // Update local event data with real-time availability
                    this.event.availableTickets = availability.availableTickets
                    this.event.totalTickets = availability.totalCapacity

                    // Adjust quantity if it exceeds available tickets
                    if (
                        this.bookingForm.quantity >
                        availability.availableTickets
                    ) {
                        this.bookingForm.quantity = Math.max(
                            1,
                            Math.min(
                                availability.availableTickets,
                                this.bookingForm.quantity
                            )
                        )
                    }
                }
            })
    }

    onUserSelected(user: UserServiceUser | null): void {
        this.selectedTestUser = user
        if (user) {
            this.bookingForm.userName = user.name
            this.bookingForm.userPhone = user.phone || ''
        } else {
            this.bookingForm.userName = ''
            this.bookingForm.userPhone = ''
        }
    }

    loadEvent(id: string): void {
        this.isLoading = true
        this.eventService.getEventById(id).subscribe({
            next: event => {
                this.event = event || null
                this.isLoading = false
            },
            error: error => {
                console.error('Error loading event:', error)
                this.isLoading = false
            },
        })
    }

    getCurrentAvailableTickets(): number {
        // Use real-time availability if available, fallback to event data
        return (
            this.currentAvailability?.availableTickets ||
            this.event?.availableTickets ||
            0
        )
    }

    getMaxSelectableTickets(): number {
        const available = this.getCurrentAvailableTickets()
        return Math.max(0, available)
    }

    increaseQuantity(): void {
        const maxTickets = this.getMaxSelectableTickets()
        if (this.bookingForm.quantity < maxTickets) {
            this.bookingForm.quantity++
        }
    }

    decreaseQuantity(): void {
        if (this.bookingForm.quantity > 1) {
            this.bookingForm.quantity--
        }
    }

    updateQuantity(event: any): void {
        const value = parseInt(event.target.value)
        const maxTickets = this.getMaxSelectableTickets()

        if (isNaN(value) || value < 1) {
            this.bookingForm.quantity = 1
            event.target.value = 1
        } else if (value > maxTickets) {
            this.bookingForm.quantity = maxTickets
            event.target.value = maxTickets
        } else {
            this.bookingForm.quantity = value
        }
    }

    onQuantityKeydown(event: KeyboardEvent): void {
        // Allow: backspace, delete, tab, escape, enter, and .
        if (
            [46, 8, 9, 27, 13, 110].indexOf(event.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (event.keyCode === 65 && event.ctrlKey === true) ||
            (event.keyCode === 67 && event.ctrlKey === true) ||
            (event.keyCode === 86 && event.ctrlKey === true) ||
            (event.keyCode === 88 && event.ctrlKey === true) ||
            // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)
        ) {
            return
        }
        // Ensure that it is a number and stop the keypress
        if (
            (event.shiftKey || event.keyCode < 48 || event.keyCode > 57) &&
            (event.keyCode < 96 || event.keyCode > 105)
        ) {
            event.preventDefault()
        }
    }

    getTotalPrice(): number {
        return this.event ? this.event.price * this.bookingForm.quantity : 0
    }

    onSubmitBooking(): void {
        if (!this.event || !this.isFormValid() || !this.selectedTestUser) {
            return
        }

        // Double-check availability before submitting
        const maxTickets = this.getMaxSelectableTickets()
        if (this.bookingForm.quantity > maxTickets) {
            this.bookingError = `Only ${maxTickets} tickets available. Please adjust your quantity.`
            this.bookingForm.quantity = Math.max(1, maxTickets)
            return
        }

        if (maxTickets === 0) {
            this.bookingError = 'Sorry, this event is sold out.'
            return
        }

        this.isBooking = true
        this.bookingError = null

        const bookingRequest: BookingApiRequest = {
            user_id: this.selectedTestUser.id,
            event_id: this.event.id,
            quantity: this.bookingForm.quantity,
        }

        console.log(
            'Booking Request Body:',
            JSON.stringify(bookingRequest, null, 2)
        )

        this.bookingService
            .createBookingWithApiFormat(bookingRequest)
            .subscribe({
                next: booking => {
                    // Update available tickets in legacy service for compatibility
                    this.eventService
                        .reduceAvailableTickets(
                            this.event!.id,
                            this.bookingForm.quantity
                        )
                        .subscribe()

                    // Force refresh real-time availability
                    this.availabilityService.refreshAvailability()

                    this.isBooking = false
                    this.bookingSuccess = true

                    // Navigate to booking confirmation after 3 seconds
                    setTimeout(() => {
                        this.router.navigate(['/my-bookings'])
                    }, 3000)
                },
                error: error => {
                    console.error('Booking failed:', error)
                    this.bookingError =
                        'Failed to create booking. Please try again.'
                    this.isBooking = false

                    // Refresh availability even on error to check if tickets were actually booked
                    this.availabilityService.refreshAvailability()
                },
            })
    }

    isFormValid(): boolean {
        const maxTickets = this.getMaxSelectableTickets()
        return !!(
            this.selectedTestUser &&
            this.bookingForm.userName.trim() &&
            this.bookingForm.quantity > 0 &&
            this.bookingForm.quantity <= maxTickets &&
            maxTickets > 0 &&
            this.event
        )
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price)
    }

    goBack(): void {
        this.router.navigate(['/events'])
    }

    getAvailabilityStatus(): { text: string; class: string } {
        if (!this.event) return { text: '', class: '' }

        const availabilityPercentage =
            (this.event.availableTickets / this.event.totalTickets) * 100

        if (availabilityPercentage === 0) {
            return { text: 'Sold Out', class: 'text-red-600 bg-red-100' }
        } else if (availabilityPercentage <= 10) {
            return {
                text: 'Almost Sold Out',
                class: 'text-orange-600 bg-orange-100',
            }
        } else if (availabilityPercentage <= 25) {
            return {
                text: 'Limited Availability',
                class: 'text-yellow-600 bg-yellow-100',
            }
        } else {
            return { text: 'Available', class: 'text-green-600 bg-green-100' }
        }
    }
}
