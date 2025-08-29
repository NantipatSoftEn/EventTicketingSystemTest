import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { Observable, Subject, BehaviorSubject, map, takeUntil } from 'rxjs'
import { Event, EventManagement } from '../../../core/models/event.model'
import { EventService } from '../../../core/services'

interface EventWithStats {
    id: number
    title: string
    description: string
    venue: string
    date: Date
    time: string
    price: number
    totalTickets: number
    availableTickets: number
    image: string
    isActive: boolean
    status: string
    createdAt: Date
    totalBookings: number
    totalRevenue: number
    totalTicketsSold: number
}

@Component({
    selector: 'app-manage-events',
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './manage-events.component.html',
    styleUrl: './manage-events.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageEventsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>()

    // Reactive streams
    events$: Observable<EventWithStats[]>
    totalRevenue$: Observable<number>
    totalTicketsSold$: Observable<number>
    activeEventsCount$: Observable<number>
    isLoading$ = new BehaviorSubject<boolean>(true)

    // Status options for the select dropdown
    statusOptions = [
        {
            value: 'active',
            label: 'Active',
            class: 'bg-green-100 text-green-800',
        },
        {
            value: 'cancelled',
            label: 'Cancelled',
            class: 'bg-red-100 text-red-800',
        },
        {
            value: 'completed',
            label: 'Completed',
            class: 'bg-gray-100 text-gray-800',
        },
    ]

    constructor(private eventService: EventService) {
        // Create reactive stream for management events with real-time updates
        this.events$ = this.eventService.getManagementEventsStream().pipe(
            map(managementEvents =>
                managementEvents.map(this.transformManagementEvent)
            ),
            takeUntil(this.destroy$)
        )

        // Create derived streams for calculated values that update automatically
        this.totalRevenue$ = this.events$.pipe(
            map(events => events.reduce((sum, e) => sum + e.totalRevenue, 0))
        )

        this.totalTicketsSold$ = this.events$.pipe(
            map(events =>
                events.reduce((sum, e) => sum + e.totalTicketsSold, 0)
            )
        )

        this.activeEventsCount$ = this.events$.pipe(
            map(events => events.filter(e => e.isActive).length)
        )
    }

    ngOnInit(): void {
        // Load initial events
        this.loadEvents()
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }

    private loadEvents(): void {
        this.eventService
            .getEventsForManagement()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.isLoading$.next(false)
                },
                error: error => {
                    console.error('Error loading events:', error)
                    this.isLoading$.next(false)
                },
            })
    }

    // Transform management event data to component format
    private transformManagementEvent(
        mgmtEvent: EventManagement
    ): EventWithStats {
        return {
            id: mgmtEvent.id,
            title: mgmtEvent.title,
            description: mgmtEvent.description,
            venue: mgmtEvent.venue,
            date: new Date(mgmtEvent.date_time),
            time: new Date(mgmtEvent.date_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
            price: parseFloat(mgmtEvent.price),
            totalTickets: mgmtEvent.capacity,
            availableTickets: mgmtEvent.available_tickets,
            image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
            isActive: mgmtEvent.status === 'active',
            status: mgmtEvent.status,
            createdAt: new Date(mgmtEvent.created_at),
            totalBookings: mgmtEvent.total_bookings,
            totalRevenue: parseFloat(mgmtEvent.total_revenue),
            totalTicketsSold: mgmtEvent.total_tickets_sold,
        }
    }

    updateEventStatus(event: EventWithStats, newStatus: string): void {
        if (newStatus === event.status) {
            return // No change needed
        }

        // Use the new reactive update method
        this.eventService
            .updateEventWithRefresh(event.id, { status: newStatus })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updated: any) => {
                    if (updated) {
                        console.log(
                            'Event status updated successfully - reactive streams will update UI automatically'
                        )
                    }
                },
                error: (error: any) => {
                    console.error('Error updating event status:', error)
                    alert('Failed to update event status. Please try again.')
                },
            })
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price)
    }

    getEventStatusClass(status: string): string {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'completed':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'active':
                return 'Active'
            case 'cancelled':
                return 'Cancelled'
            case 'completed':
                return 'Completed'
            default:
                return status
        }
    }

    getAvailabilityStatus(event: EventWithStats): {
        text: string
        class: string
    } {
        const availabilityPercentage =
            (event.availableTickets / event.totalTickets) * 100

        if (availabilityPercentage === 0) {
            return { text: 'Sold Out', class: 'text-red-600' }
        } else if (availabilityPercentage <= 10) {
            return { text: 'Almost Sold Out', class: 'text-orange-600' }
        } else if (availabilityPercentage <= 25) {
            return { text: 'Limited', class: 'text-yellow-600' }
        } else {
            return { text: 'Available', class: 'text-green-600' }
        }
    }

    isEventPast(eventDate: Date): boolean {
        return new Date(eventDate) < new Date()
    }

    // Helper methods for template
    trackByEventId(index: number, event: EventWithStats): number {
        return event.id
    }
}
