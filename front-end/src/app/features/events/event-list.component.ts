import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Event, EventFilters } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-event-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  isLoading = false;

  filters: EventFilters = {
    search: '',
    venue: '',
    dateFrom: undefined,
    dateTo: undefined
  };

  // String versions for HTML date inputs
  dateFromInput: string = '';
  dateToInput: string = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
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

  applyFilters(): void {
    this.isLoading = true;
    const activeFilters: EventFilters = {};

    if (this.filters.search?.trim()) {
      activeFilters.search = this.filters.search.trim();
    }
    if (this.filters.venue?.trim()) {
      activeFilters.venue = this.filters.venue.trim();
    }
    
    // Convert string inputs to Date objects for filtering
    if (this.dateFromInput) {
      activeFilters.dateFrom = new Date(this.dateFromInput);
      console.log('Date From Filter:', this.dateFromInput, '-> Date object:', activeFilters.dateFrom);
    }
    if (this.dateToInput) {
      activeFilters.dateTo = new Date(this.dateToInput);
      console.log('Date To Filter:', this.dateToInput, '-> Date object:', activeFilters.dateTo);
    }

    console.log('Applying filters:', activeFilters);

    this.eventService.getEvents(activeFilters).subscribe({
      next: (events: Event[]) => {
        console.log('Filtered events result:', events.length, 'events found');
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
      venue: '',
      dateFrom: undefined,
      dateTo: undefined
    };
    this.dateFromInput = '';
    this.dateToInput = '';
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
