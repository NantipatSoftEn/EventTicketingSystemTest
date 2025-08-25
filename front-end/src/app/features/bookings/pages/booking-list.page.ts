import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService, AuthService } from '../../../core/services';
import { Booking } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message.component';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './booking-list.page.html',
  styles: []
})
export class BookingListPageComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  bookings = signal<Booking[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  showCancelModal = signal<boolean>(false);
  isCancelling = signal<boolean>(false);
  bookingToCancel: Booking | null = null;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookingService.getUserBookings().subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings.set(response.data);
        } else {
          this.errorMessage.set(response.message || 'Failed to load bookings');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.errorMessage.set('Failed to load bookings. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canCancel(booking: Booking): boolean {
    if (!booking.event) return false;
    const eventDate = new Date(booking.event.date);
    const now = new Date();
    // Allow cancellation if event is more than 24 hours away
    return eventDate.getTime() - now.getTime() > 24 * 60 * 60 * 1000;
  }

  confirmCancellation(booking: Booking): void {
    this.bookingToCancel = booking;
    this.showCancelModal.set(true);
  }

  cancelBooking(): void {
    if (!this.bookingToCancel) return;

    this.isCancelling.set(true);

    this.bookingService.cancelBooking(this.bookingToCancel.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Update the booking status in the list
          const updatedBookings = this.bookings().map(booking =>
            booking.id === this.bookingToCancel!.id
              ? { ...booking, status: 'CANCELLED' as any }
              : booking
          );
          this.bookings.set(updatedBookings);
          this.closeCancelModal();
        } else {
          this.errorMessage.set(response.message || 'Failed to cancel booking');
        }
        this.isCancelling.set(false);
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        this.errorMessage.set('Failed to cancel booking. Please try again.');
        this.isCancelling.set(false);
      }
    });
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.bookingToCancel = null;
  }

  clearError(): void {
    this.errorMessage.set(null);
  }
}
