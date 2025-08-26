import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Event, EventFilters } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { DevModeToggleComponent } from '../../shared/components/dev-mode-toggle/dev-mode-toggle.component';

@Component({
  selector: 'app-event-list',
  imports: [CommonModule, FormsModule, RouterLink, DevModeToggleComponent],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  categories: string[] = [];
  venues: string[] = [];
  isLoading = false;

  filters: EventFilters = {
    search: '',
    category: '',
    venue: '',
    dateFrom: undefined,
    dateTo: undefined
  };

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadCategories();
    this.loadVenues();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (events: Event[]) => {
        this.events = events;
        this.filteredEvents = events;
        this.isLoading = false;
        console.log('Events loaded:', events);
      },
      error: (error: any) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: (categories: string[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadVenues(): void {
    this.eventService.getVenues().subscribe({
      next: (venues: string[]) => {
        this.venues = venues;
      },
      error: (error: any) => {
        console.error('Error loading venues:', error);
      }
    });
  }

  applyFilters(): void {
    this.isLoading = true;
    const activeFilters: EventFilters = {};

    if (this.filters.search?.trim()) {
      activeFilters.search = this.filters.search.trim();
    }
    if (this.filters.category) {
      activeFilters.category = this.filters.category;
    }
    if (this.filters.venue) {
      activeFilters.venue = this.filters.venue;
    }
    if (this.filters.dateFrom) {
      activeFilters.dateFrom = this.filters.dateFrom;
    }
    if (this.filters.dateTo) {
      activeFilters.dateTo = this.filters.dateTo;
    }

    this.eventService.getEvents(activeFilters).subscribe({
      next: (events: Event[]) => {
        this.filteredEvents = events;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error filtering events:', error);
        this.isLoading = false;
      }
    });
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      category: '',
      venue: '',
      dateFrom: undefined,
      dateTo: undefined
    };
    this.filteredEvents = this.events;
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

  getAvailabilityStatus(event: Event): { text: string; class: string } {
    const availabilityPercentage = (event.availableTickets / event.totalTickets) * 100;

    if (availabilityPercentage === 0) {
      return { text: 'Sold Out', class: 'text-red-600' };
    } else if (availabilityPercentage <= 10) {
      return { text: 'Almost Sold Out', class: 'text-orange-600' };
    } else if (availabilityPercentage <= 25) {
      return { text: 'Limited Availability', class: 'text-yellow-600' };
    } else {
      return { text: 'Available', class: 'text-green-600' };
    }
  }
}
