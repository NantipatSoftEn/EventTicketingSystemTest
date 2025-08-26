import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../../core/models/event.model';
import { BookingRequest } from '../../core/models/booking.model';
import { EventService } from '../../core/services/event.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  isLoading = false;
  isBooking = false;
  bookingSuccess = false;
  bookingError: string | null = null;

  bookingForm = {
    quantity: 1,
    userEmail: '',
    userName: '',
    userPhone: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.params['id'];
    if (eventId) {
      this.loadEvent(eventId);
    }

    // Pre-fill form with current user data if available
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.bookingForm.userEmail = currentUser.email;
      this.bookingForm.userName = currentUser.name;
      this.bookingForm.userPhone = currentUser.phone || '';
    }
  }

  loadEvent(id: string): void {
    this.isLoading = true;
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.isLoading = false;
      }
    });
  }

  increaseQuantity(): void {
    if (this.event && this.bookingForm.quantity < this.event.availableTickets) {
      this.bookingForm.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.bookingForm.quantity > 1) {
      this.bookingForm.quantity--;
    }
  }

  updateQuantity(event: any): void {
    const value = parseInt(event.target.value);
    if (value >= 1 && this.event && value <= this.event.availableTickets) {
      this.bookingForm.quantity = value;
    }
  }

  getTotalPrice(): number {
    return this.event ? this.event.price * this.bookingForm.quantity : 0;
  }

  onSubmitBooking(): void {
    if (!this.event || !this.isFormValid()) {
      return;
    }

    this.isBooking = true;
    this.bookingError = null;

    const bookingRequest: BookingRequest = {
      eventId: this.event.id,
      quantity: this.bookingForm.quantity,
      userEmail: this.bookingForm.userEmail,
      userName: this.bookingForm.userName,
      userPhone: this.bookingForm.userPhone
    };

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (booking) => {
        // Update available tickets
        this.eventService.reduceAvailableTickets(this.event!.id, this.bookingForm.quantity).subscribe();

        this.isBooking = false;
        this.bookingSuccess = true;

        // Navigate to booking confirmation after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/my-bookings']);
        }, 3000);
      },
      error: (error) => {
        console.error('Booking failed:', error);
        this.bookingError = 'Failed to create booking. Please try again.';
        this.isBooking = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.bookingForm.userEmail.trim() &&
      this.bookingForm.userName.trim() &&
      this.bookingForm.quantity > 0 &&
      this.event &&
      this.bookingForm.quantity <= this.event.availableTickets
    );
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  getAvailabilityStatus(): { text: string; class: string } {
    if (!this.event) return { text: '', class: '' };

    const availabilityPercentage = (this.event.availableTickets / this.event.totalTickets) * 100;

    if (availabilityPercentage === 0) {
      return { text: 'Sold Out', class: 'text-red-600 bg-red-100' };
    } else if (availabilityPercentage <= 10) {
      return { text: 'Almost Sold Out', class: 'text-orange-600 bg-orange-100' };
    } else if (availabilityPercentage <= 25) {
      return { text: 'Limited Availability', class: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'Available', class: 'text-green-600 bg-green-100' };
    }
  }
}
