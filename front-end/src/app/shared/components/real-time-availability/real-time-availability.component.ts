import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Observable, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { TicketAvailabilityService } from '../../../core/services'

@Component({
    selector: 'app-real-time-availability',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="flex items-center space-x-2">
            <!-- Availability Status Badge -->
            <div
                *ngIf="availabilityStatus$ | async as status"
                [class]="
                    'rounded-full px-2 py-1 text-xs font-medium ' + status.class
                "
            >
                {{ status.text }}
            </div>

            <!-- Ticket Count -->
            <span
                *ngIf="
                    availability$ | async as availability;
                    else fallbackCount
                "
                class="text-sm text-gray-600"
            >
                {{ availability.availableTickets }} /
                {{ availability.totalCapacity }} left
            </span>

            <!-- Fallback to static data -->
            <ng-template #fallbackCount>
                <span class="text-sm text-gray-600">
                    {{ fallbackAvailable }} / {{ fallbackTotal }} left
                </span>
            </ng-template>

            <!-- Live indicator when polling -->
            <div
                *ngIf="isPolling$ | async"
                class="flex items-center text-xs text-green-500"
                title="Real-time updates"
            >
                <div
                    class="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-500"
                ></div>
                LIVE
            </div>
        </div>
    `,
})
export class RealTimeAvailabilityComponent implements OnInit, OnDestroy {
    @Input() eventId!: number
    @Input() fallbackAvailable: number = 0
    @Input() fallbackTotal: number = 0
    @Input() compact: boolean = false

    private destroy$ = new Subject<void>()

    availability$!: Observable<any>
    availabilityStatus$!: Observable<any>
    isPolling$!: Observable<boolean>

    constructor(private availabilityService: TicketAvailabilityService) {}

    ngOnInit(): void {
        if (this.eventId) {
            this.availability$ = this.availabilityService.getEventAvailability(
                this.eventId
            )
            this.availabilityStatus$ =
                this.availabilityService.getAvailabilityStatus(this.eventId)
            this.isPolling$ = this.availabilityService.isPolling$
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }
}
