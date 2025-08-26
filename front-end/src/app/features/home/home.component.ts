import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <!-- Main content area -->
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to EventTicketing
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover amazing events, book tickets instantly, and create unforgettable memories.
        </p>
        <div class="space-x-4">
          <a routerLink="/events" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block">
            Browse Events
          </a>
          <a routerLink="/events" class="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block">
            Learn More
          </a>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div class="text-center p-6">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Easy Booking</h3>
          <p class="text-gray-600">Book your favorite events with just a few clicks. Simple, fast, and secure.</p>
        </div>

        <div class="text-center p-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Instant Tickets</h3>
          <p class="text-gray-600">Get your tickets immediately after booking. No waiting, no hassle.</p>
        </div>

        <div class="text-center p-6">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
          <p class="text-gray-600">Our support team is always ready to help you with any questions or issues.</p>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="bg-blue-50 rounded-2xl p-8 md:p-12 mt-16 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ready to Experience Amazing Events?
        </h2>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of happy customers who trust us for their event ticketing needs.
        </p>
        <a routerLink="/events" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-medium transition-colors inline-block">
          Start Exploring Events
        </a>
      </div>
    </div>
  `
})
export class HomeComponent {}
