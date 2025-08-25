import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService, BookingService, AuthService } from '../../../core/services';
import { Event, CreateBookingRequest } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './event-detail.page.html',
  styles: []
})
export class EventDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);

  authService = inject(AuthService);

  event = signal<Event | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  isBooking = signal<boolean>(false);
  bookingError = signal<string | null>(null);

  selectedQuantity = 1;

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(+eventId);
    } else {
      this.errorMessage.set('Invalid event ID');
      this.isLoading.set(false);
    }
  }

  loadEvent(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.eventService.getEvent(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.event.set(response.data);
        } else {
          this.errorMessage.set(response.message || 'Event not found');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.errorMessage.set('Failed to load event details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAvailableQuantities(): number[] {
    const maxQuantity = Math.min(this.event()?.availableTickets || 0, 10);
    return Array.from({ length: maxQuantity }, (_, i) => i + 1);
  }

  getTotalPrice(): number {
    return (this.event()?.price || 0) * this.selectedQuantity;
  }

  onBookTickets(): void {
    const currentEvent = this.event();
    if (!currentEvent || this.isBooking()) return;

    this.isBooking.set(true);
    this.bookingError.set(null);

    const bookingRequest: CreateBookingRequest = {
      eventId: currentEvent.id,
      quantity: this.selectedQuantity
    };

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (response) => {
        if (response.success) {
          // Redirect to booking confirmation page
          this.router.navigate(['/bookings', response.data.id]);
        } else {
          this.bookingError.set(response.message || 'Booking failed');
        }
        this.isBooking.set(false);
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        this.bookingError.set('Failed to create booking. Please try again.');
        this.isBooking.set(false);
      }
    });
  }

  redirectToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  clearBookingError(): void {
    this.bookingError.set(null);
  }
}
