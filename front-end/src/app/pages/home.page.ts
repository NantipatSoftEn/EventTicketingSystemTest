import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../core/services';
import { Event } from '../core/models';
import { EventCardComponent } from '../features/events/components/event-card.component';
import { LoadingSpinnerComponent } from '../shared/components/ui/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, EventCardComponent, LoadingSpinnerComponent],
  template: `
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Welcome to EventTicket
          </h1>
          <p class="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Discover amazing events, book tickets instantly, and create unforgettable memories.
            Your gateway to the best experiences in your city.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              routerLink="/events"
              class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Browse Events
            </a>
            <a
              routerLink="/register"
              class="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-medium rounded-md text-white hover:bg-white hover:text-indigo-600 transition-colors duration-200"
            >
              Sign Up Now
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose EventTicket?</h2>
          <p class="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            We make event discovery and ticket booking simple, secure, and enjoyable.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="text-center">
            <div class="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Easy Discovery</h3>
            <p class="text-gray-600">
              Find events that match your interests with our powerful search and filtering options.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center">
            <div class="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Secure Booking</h3>
            <p class="text-gray-600">
              Your payment information is protected with industry-standard security measures.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center">
            <div class="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Instant Tickets</h3>
            <p class="text-gray-600">
              Get your tickets instantly after booking with unique QR codes for easy entry.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Events Section -->
    <div class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
          <p class="text-xl text-gray-600">
            Don't miss out on these popular events happening soon
          </p>
        </div>

        @if (isLoadingEvents()) {
          <app-loading-spinner
            size="lg"
            text="Loading featured events..."
            containerClass="py-8"
          ></app-loading-spinner>
        } @else {
          @if (featuredEvents().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              @for (event of featuredEvents(); track event.id) {
                <app-event-card
                  [event]="event"
                  (bookNow)="onBookEvent($event)"
                ></app-event-card>
              }
            </div>

            <div class="text-center">
              <a
                routerLink="/events"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 shadow-sm transition-colors duration-200"
              >
                View All Events
                <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          } @else {
            <div class="text-center py-8">
              <p class="text-gray-600 mb-4">No featured events available at the moment.</p>
              <a
                routerLink="/events"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
              >
                Browse All Events
              </a>
            </div>
          }
        }
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-indigo-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-white mb-4">
            Ready to Discover Amazing Events?
          </h2>
          <p class="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event-goers who trust EventTicket for their entertainment needs.
          </p>
          <a
            routerLink="/events"
            class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomePageComponent implements OnInit {
  private eventService = inject(EventService);

  featuredEvents = signal<Event[]>([]);
  isLoadingEvents = signal<boolean>(false);

  ngOnInit(): void {
    this.loadFeaturedEvents();
  }

  loadFeaturedEvents(): void {
    this.isLoadingEvents.set(true);

    // Load a limited number of events for the featured section
    this.eventService.getEvents().subscribe({
      next: (response) => {
        if (response.success) {
          // Take first 6 events as featured events
          this.featuredEvents.set(response.data.slice(0, 6));
        }
        this.isLoadingEvents.set(false);
      },
      error: (error) => {
        console.error('Error loading featured events:', error);
        this.isLoadingEvents.set(false);
      }
    });
  }

  onBookEvent(event: Event): void {
    // This will be handled by the event card component
    // Implementation depends on routing and authentication state
  }
}
