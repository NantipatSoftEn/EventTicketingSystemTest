import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService, AuthService } from '../../../core/services';
import { Event, EventSearchFilter } from '../../../core/models';
import { EventCardComponent } from '../components/event-card.component';
import { EventSearchComponent } from '../components/event-search.component';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    EventCardComponent,
    EventSearchComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './event-list.page.html',
  styles: []
})
export class EventListPageComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('searchComponent') searchComponent!: EventSearchComponent;

  events = signal<Event[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  currentFilter = signal<EventSearchFilter | null>(null);

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(filter?: EventSearchFilter): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.currentFilter.set(filter || null);

    this.eventService.getEvents(filter).subscribe({
      next: (response) => {
        if (response.success) {
          this.events.set(response.data);
          this.searchComponent?.updateResultCount(response.data.length);
        } else {
          this.errorMessage.set(response.message || 'Failed to load events');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.errorMessage.set('Failed to load events. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(filter: EventSearchFilter): void {
    this.loadEvents(filter);
  }

  onBookEvent(event: Event): void {
    if (!this.authService.isAuthenticated()) {
      // Redirect to login with return URL
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/events/${event.id}` }
      });
      return;
    }

    // Navigate to event detail page for booking
    this.router.navigate(['/events', event.id]);
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  clearAllFilters(): void {
    this.searchComponent?.clearFilters();
  }

  hasActiveFilters(): boolean {
    const filter = this.currentFilter();
    return !!(filter?.query || filter?.venue || filter?.startDate || filter?.endDate);
  }
}
