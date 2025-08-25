import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services';
import { Booking } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message.component';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (isLoading()) {
          <app-loading-spinner
            size="lg"
            text="Loading booking details..."
            containerClass="py-16"
          ></app-loading-spinner>
        }

        @if (errorMessage()) {
          <app-error-message
            type="error"
            title="Error Loading Booking"
            [message]="errorMessage()"
            (dismiss)="clearError()"
          ></app-error-message>
        }

        @if (booking() && !isLoading()) {
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center text-gray-600 mb-4">
              <button
                (click)="goBack()"
                class="flex items-center hover:text-gray-800 transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to My Bookings
              </button>
            </div>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Booking Confirmation</h1>
                <p class="text-gray-600">Booking #{{ booking()!.bookingCode }}</p>
              </div>
              <div class="mt-4 md:mt-0">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  [ngClass]="{
                    'bg-green-100 text-green-800': booking()!.status === 'CONFIRMED',
                    'bg-yellow-100 text-yellow-800': booking()!.status === 'PENDING',
                    'bg-red-100 text-red-800': booking()!.status === 'CANCELLED'
                  }"
                >
                  {{ booking()!.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Success Message for New Bookings -->
          @if (isNewBooking()) {
            <div class="mb-8 bg-green-50 border border-green-200 rounded-md p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">Booking Confirmed!</h3>
                  <div class="mt-2 text-sm text-green-700">
                    <p>Your tickets have been successfully booked. Please save this page or take a screenshot for your records.</p>
                  </div>
                </div>
              </div>
            </div>
          }

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Event Details -->
              @if (booking()!.event) {
                <div class="bg-white rounded-lg shadow-md p-6">
                  <h2 class="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
                  <div class="space-y-4">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">{{ booking()!.event!.title }}</h3>
                      <p class="text-gray-600 mt-1">{{ booking()!.event!.description }}</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt class="font-medium text-gray-500">Date & Time</dt>
                        <dd class="text-gray-900">{{ formatDate(booking()!.event!.date) }}</dd>
                      </div>
                      <div>
                        <dt class="font-medium text-gray-500">Venue</dt>
                        <dd class="text-gray-900">{{ booking()!.event!.venue }}</dd>
                      </div>
                      <div>
                        <dt class="font-medium text-gray-500">Ticket Price</dt>
                        <dd class="text-gray-900">\${{ booking()!.event!.price }} each</dd>
                      </div>
                      <div>
                        <dt class="font-medium text-gray-500">Quantity</dt>
                        <dd class="text-gray-900">{{ booking()!.quantity }} ticket{{ booking()!.quantity > 1 ? 's' : '' }}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Tickets -->
              @if (booking()?.tickets && booking()!.tickets!.length > 0) {
                <div class="bg-white rounded-lg shadow-md p-6">
                  <h2 class="text-xl font-bold text-gray-900 mb-4">Your Tickets</h2>
                  <div class="space-y-4">
                    @for (ticket of booking()!.tickets!; track ticket.id; let i = $index) {
                      <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start">
                          <div>
                            <h4 class="font-medium text-gray-900">Ticket {{ i + 1 }}</h4>
                            <p class="text-sm text-gray-600 font-mono">{{ ticket.ticketCode }}</p>
                            <span
                              class="inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium"
                              [ngClass]="{
                                'bg-green-100 text-green-800': ticket.status === 'ACTIVE',
                                'bg-blue-100 text-blue-800': ticket.status === 'USED',
                                'bg-red-100 text-red-800': ticket.status === 'CANCELLED'
                              }"
                            >
                              {{ ticket.status }}
                            </span>
                          </div>
                          <!-- QR Code Placeholder -->
                          <div class="text-center">
                            <div class="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded">
                              <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h.01M12 12v4.01M12 16h.01" />
                              </svg>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">QR Code</p>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
              <div class="sticky top-8 space-y-6">
                <!-- Booking Summary -->
                <div class="bg-white rounded-lg shadow-md p-6">
                  <h3 class="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>
                  <dl class="space-y-3">
                    <div class="flex justify-between">
                      <dt class="text-sm text-gray-600">Booking Code:</dt>
                      <dd class="text-sm font-mono text-gray-900">{{ booking()!.bookingCode }}</dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-sm text-gray-600">Quantity:</dt>
                      <dd class="text-sm text-gray-900">{{ booking()!.quantity }}</dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-sm text-gray-600">Price per ticket:</dt>
                      <dd class="text-sm text-gray-900">\${{ booking()!.event?.price || 0 }}</dd>
                    </div>
                    <div class="border-t pt-3">
                      <div class="flex justify-between">
                        <dt class="text-base font-medium text-gray-900">Total:</dt>
                        <dd class="text-base font-bold text-gray-900">\${{ booking()!.totalPrice }}</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <!-- Booking Info -->
                <div class="bg-white rounded-lg shadow-md p-6">
                  <h3 class="text-lg font-bold text-gray-900 mb-4">Booking Information</h3>
                  <dl class="space-y-3">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Booked on:</dt>
                      <dd class="text-sm text-gray-900">{{ formatDate(booking()!.createdAt) }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Status:</dt>
                      <dd class="text-sm text-gray-900">{{ booking()!.status }}</dd>
                    </div>
                  </dl>
                </div>

                <!-- Important Notes -->
                <div class="bg-blue-50 rounded-lg p-6">
                  <h3 class="text-sm font-medium text-blue-900 mb-2">Important Notes</h3>
                  <ul class="text-sm text-blue-800 space-y-1">
                    <li>• Please arrive 30 minutes before the event starts</li>
                    <li>• Bring a valid photo ID for verification</li>
                    <li>• Show your ticket QR code at the entrance</li>
                    <li>• Tickets are non-transferable</li>
                  </ul>
                </div>

                <!-- Actions -->
                @if (booking()!.status === 'CONFIRMED' && canCancel()) {
                  <button
                    (click)="cancelBooking()"
                    class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Cancel Booking
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class BookingDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  booking = signal<Booking | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBooking(+bookingId);
    } else {
      this.errorMessage.set('Invalid booking ID');
      this.isLoading.set(false);
    }
  }

  loadBooking(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookingService.getBooking(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.booking.set(response.data);
        } else {
          this.errorMessage.set(response.message || 'Booking not found');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.errorMessage.set('Failed to load booking details. Please try again.');
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

  isNewBooking(): boolean {
    // Check if this is a new booking (within last 5 minutes)
    const booking = this.booking();
    if (!booking) return false;

    const now = new Date();
    const bookingTime = new Date(booking.createdAt);
    const diffMinutes = (now.getTime() - bookingTime.getTime()) / (1000 * 60);

    return diffMinutes <= 5;
  }

  canCancel(): boolean {
    const booking = this.booking();
    if (!booking?.event) return false;

    const eventDate = new Date(booking.event.date);
    const now = new Date();
    // Allow cancellation if event is more than 24 hours away
    return eventDate.getTime() - now.getTime() > 24 * 60 * 60 * 1000;
  }

  cancelBooking(): void {
    const booking = this.booking();
    if (!booking) return;

    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      this.bookingService.cancelBooking(booking.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Update the booking status
            this.booking.set({ ...booking, status: 'CANCELLED' as any });
          } else {
            this.errorMessage.set(response.message || 'Failed to cancel booking');
          }
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          this.errorMessage.set('Failed to cancel booking. Please try again.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }

  clearError(): void {
    this.errorMessage.set(null);
  }
}
