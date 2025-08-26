import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../core/services/event.service';
import { BookingService } from '../../../core/services/booking.service';
import { forkJoin } from 'rxjs';

interface EventWithStats extends Event {
  totalBookings: number;
  totalRevenue: number;
  totalTicketsSold: number;
}

@Component({
  selector: 'app-manage-events',
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-events.component.html',
  styleUrl: './manage-events.component.css'
})
export class ManageEventsComponent implements OnInit {
  events: EventWithStats[] = [];
  isLoading = false;

  constructor(
    private eventService: EventService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.loadEventStats(events);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  loadEventStats(events: Event[]): void {
    if (events.length === 0) {
      this.events = [];
      this.isLoading = false;
      return;
    }

    const statsRequests = events.map(event =>
      this.bookingService.getBookingStats(event.id)
    );

    forkJoin(statsRequests).subscribe({
      next: (stats) => {
        this.events = events.map((event, index) => ({
          ...event,
          totalBookings: stats[index].totalBookings,
          totalRevenue: stats[index].totalRevenue,
          totalTicketsSold: stats[index].totalTickets
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading event stats:', error);
        // Still show events without stats
        this.events = events.map(event => ({
          ...event,
          totalBookings: 0,
          totalRevenue: 0,
          totalTicketsSold: 0
        }));
        this.isLoading = false;
      }
    });
  }

  toggleEventStatus(event: EventWithStats): void {
    const updatedEvent = { ...event, isActive: !event.isActive };

    this.eventService.updateEvent(event.id, { isActive: updatedEvent.isActive }).subscribe({
      next: (updated) => {
        if (updated) {
          event.isActive = updatedEvent.isActive;
        }
      },
      error: (error) => {
        console.error('Error updating event status:', error);
        alert('Failed to update event status. Please try again.');
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getEventStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  getAvailabilityStatus(event: Event): { text: string; class: string } {
    const availabilityPercentage = (event.availableTickets / event.totalTickets) * 100;

    if (availabilityPercentage === 0) {
      return { text: 'Sold Out', class: 'text-red-600' };
    } else if (availabilityPercentage <= 10) {
      return { text: 'Almost Sold Out', class: 'text-orange-600' };
    } else if (availabilityPercentage <= 25) {
      return { text: 'Limited', class: 'text-yellow-600' };
    } else {
      return { text: 'Available', class: 'text-green-600' };
    }
  }

  isEventPast(eventDate: Date): boolean {
    return new Date(eventDate) < new Date();
  }

  getActiveEventsCount(): number {
    return this.events.filter(e => e.isActive).length;
  }

  getTotalRevenue(): number {
    return this.events.reduce((sum, e) => sum + e.totalRevenue, 0);
  }

  getTotalTicketsSold(): number {
    return this.events.reduce((sum, e) => sum + e.totalTicketsSold, 0);
  }
}
