import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, BookingService } from '../../../core/services';
import { Event, Booking } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.css']
})
export class AdminDashboardPageComponent implements OnInit {
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);

  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  recentEvents = signal<Event[]>([]);
  recentBookings = signal<Booking[]>([]);

  stats = {
    totalEvents: 0,
    activeEvents: 0,
    totalBookings: 0,
    totalRevenue: 0
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Load events and bookings in parallel
    Promise.all([
      this.loadEvents(),
      this.loadBookings()
    ]).then(() => {
      this.isLoading.set(false);
    }).catch((error) => {
      console.error('Error loading dashboard data:', error);
      this.errorMessage.set('Failed to load dashboard data. Please try again.');
      this.isLoading.set(false);
    });
  }

  private loadEvents(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.eventService.getEvents().subscribe({
        next: (response) => {
          if (response.success) {
            const events = response.data;
            this.recentEvents.set(events.slice(0, 5)); // Show first 5 events

            // Calculate stats
            this.stats.totalEvents = events.length;
            this.stats.activeEvents = events.filter(event => event.isActive).length;

            resolve();
          } else {
            reject(new Error(response.message || 'Failed to load events'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private loadBookings(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bookingService.getAllBookings().subscribe({
        next: (response) => {
          if (response.success) {
            const bookings = response.data;
            this.recentBookings.set(bookings.slice(0, 5)); // Show first 5 bookings

            // Calculate stats
            this.stats.totalBookings = bookings.length;
            this.stats.totalRevenue = bookings
              .filter(booking => booking.status === 'CONFIRMED')
              .reduce((total, booking) => total + booking.totalPrice, 0);

            resolve();
          } else {
            reject(new Error(response.message || 'Failed to load bookings'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearError(): void {
    this.errorMessage.set(null);
  }
}
