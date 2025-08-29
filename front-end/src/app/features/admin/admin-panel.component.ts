import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router'
import {
    AuthService,
    AdminStateService,
    AdminDashboardStats,
} from '../../core/services'
import { Subject, takeUntil } from 'rxjs'

@Component({
    selector: 'app-admin-panel',
    imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
    templateUrl: './admin-panel.component.html',
    styleUrl: './admin-panel.component.css',
})
export class AdminPanelComponent implements OnInit, OnDestroy {
    stats: AdminDashboardStats = {
        totalEvents: 0,
        totalRevenue: 0,
        totalBookings: 0,
        totalTicketsSold: 0,
        isLoading: false,
    }

    private destroy$ = new Subject<void>()

    // Computed properties for backward compatibility
    get isLoading(): boolean {
        return this.stats.isLoading
    }

    get totalEvents(): number {
        return this.stats.totalEvents
    }

    get totalRevenue(): number {
        return this.stats.totalRevenue
    }

    get totalBookings(): number {
        return this.stats.totalBookings
    }

    get totalTicketsSold(): number {
        return this.stats.totalTicketsSold
    }

    constructor(
        private authService: AuthService,
        private adminStateService: AdminStateService
    ) {}

    ngOnInit(): void {
        // Subscribe to stats changes
        this.adminStateService.stats$
            .pipe(takeUntil(this.destroy$))
            .subscribe(stats => {
                this.stats = stats
            })

        // Load initial data
        this.adminStateService.loadDashboardStats()
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }

    loadDashboardStats(): void {
        this.adminStateService.refreshStats()
    }

    loadBookingStats(): void {
        // This method is now handled by the AdminStateService
        // Keeping for backward compatibility but functionality moved to service
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price)
    }

    isAdmin(): boolean {
        return true
        // return this.authService.isAdmin();
    }
}
