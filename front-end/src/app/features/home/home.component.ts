import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
    selector: 'app-home',
    imports: [RouterLink],
    template: `
        <!-- Main content area -->
        <div class="container mx-auto px-4 py-8">
            <div class="text-center">
                <h1 class="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
                    Welcome to EventTicketing
                </h1>
                <p class="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
                    Discover amazing events, book tickets instantly, and create
                    unforgettable memories.
                </p>
                <div class="space-x-4">
                    <a
                        routerLink="/events"
                        class="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Browse Events
                    </a>
                    <a
                        routerLink="/events"
                        class="inline-block rounded-lg border border-blue-600 px-8 py-3 text-lg font-medium text-blue-600 transition-colors hover:bg-blue-50"
                    >
                        Learn More
                    </a>
                </div>
            </div>

            <!-- Features Section -->
            <div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div class="p-6 text-center">
                    <div
                        class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
                    >
                        <svg
                            class="h-8 w-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                        </svg>
                    </div>
                    <h3 class="mb-2 text-xl font-semibold text-gray-900">
                        Easy Booking
                    </h3>
                    <p class="text-gray-600">
                        Book your favorite events with just a few clicks.
                        Simple, fast, and secure.
                    </p>
                </div>

                <div class="p-6 text-center">
                    <div
                        class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                    >
                        <svg
                            class="h-8 w-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                            ></path>
                        </svg>
                    </div>
                    <h3 class="mb-2 text-xl font-semibold text-gray-900">
                        Instant Tickets
                    </h3>
                    <p class="text-gray-600">
                        Get your tickets immediately after booking. No waiting,
                        no hassle.
                    </p>
                </div>

                <div class="p-6 text-center">
                    <div
                        class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100"
                    >
                        <svg
                            class="h-8 w-8 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                    </div>
                    <h3 class="mb-2 text-xl font-semibold text-gray-900">
                        24/7 Support
                    </h3>
                    <p class="text-gray-600">
                        Our support team is always ready to help you with any
                        questions or issues.
                    </p>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="mt-16 rounded-2xl bg-blue-50 p-8 text-center md:p-12">
                <h2 class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                    Ready to Experience Amazing Events?
                </h2>
                <p class="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
                    Join thousands of happy customers who trust us for their
                    event ticketing needs.
                </p>
                <a
                    routerLink="/events"
                    class="inline-block rounded-lg bg-blue-600 px-8 py-4 text-xl font-medium text-white transition-colors hover:bg-blue-700"
                >
                    Start Exploring Events
                </a>
            </div>
        </div>
    `,
})
export class HomeComponent {}
