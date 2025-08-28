import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Event, EventManagement } from '../../../core/models/event.model';
import { EventService } from '../../../core/services/event.service';

interface EventWithStats {
  id: number;
  title: string;
  description: string;
  venue: string;
  date: Date;
  time: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  image: string;
  isActive: boolean;
  status: string;
  createdAt: Date;
  totalBookings: number;
  totalRevenue: number;
  totalTicketsSold: number;
}

@Component({
  selector: 'app-manage-events',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './manage-events.component.html',
  styleUrl: './manage-events.component.css'
})
export class ManageEventsComponent implements OnInit {
  events: EventWithStats[] = [];
  isLoading = false;

  // Status options for the select dropdown
  statusOptions = [
    { value: 'active', label: 'Active', class: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', class: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', class: 'bg-gray-100 text-gray-800' }
  ];

  // Cache calculated values
  private _totalRevenue = 0;
  private _totalTicketsSold = 0;
  private _activeEventsCount = 0;

  constructor(
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;

    // Use the optimized management endpoint instead of multiple API calls
    this.eventService.getEventsForManagement().subscribe({
      next: (managementEvents) => {
        this.events = managementEvents.map(this.transformManagementEvent);
        this.calculateTotals(); // คำนวณครั้งเดียวหลังโหลดข้อมูล
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  // คำนวณครั้งเดียวและเก็บไว้
  private calculateTotals(): void {
    this._totalRevenue = this.events.reduce((sum, e) => sum + e.totalRevenue, 0);
    this._totalTicketsSold = this.events.reduce((sum, e) => sum + e.totalTicketsSold, 0);
    this._activeEventsCount = this.events.filter(e => e.isActive).length;
  }

  // Transform management event data to component format
  private transformManagementEvent(mgmtEvent: EventManagement): EventWithStats {
    return {
      id: mgmtEvent.id,
      title: mgmtEvent.title,
      description: mgmtEvent.description,
      venue: mgmtEvent.venue,
      date: new Date(mgmtEvent.date_time),
      time: new Date(mgmtEvent.date_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      price: parseFloat(mgmtEvent.price),
      totalTickets: mgmtEvent.capacity,
      availableTickets: mgmtEvent.available_tickets,
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
      isActive: mgmtEvent.status === 'active',
      status: mgmtEvent.status,
      createdAt: new Date(mgmtEvent.created_at),
      totalBookings: mgmtEvent.total_bookings,
      totalRevenue: parseFloat(mgmtEvent.total_revenue),
      totalTicketsSold: mgmtEvent.total_tickets_sold
    };
  }

  updateEventStatus(event: EventWithStats, newStatus: string): void {
    if (newStatus === event.status) {
      return; // No change needed
    }

    // Pass the status field directly to the service
    const updateData = {
      status: newStatus
    };

    this.eventService.updateEvent(event.id, updateData).subscribe({
      next: (updated: any) => {
        if (updated) {
          event.status = newStatus;
          event.isActive = newStatus === 'active';
          this.calculateTotals(); // Recalculate when status changes
        }
      },
      error: (error: any) => {
        console.error('Error updating event status:', error);
        alert('Failed to update event status. Please try again.');

        // Revert the UI change if the API call failed
        // This would need to be handled by resetting the select value
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

  getEventStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  }

  getAvailabilityStatus(event: EventWithStats): { text: string; class: string } {
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
    return this._activeEventsCount;
  }

  getTotalRevenue(): number {
    return this._totalRevenue;
  }

  getTotalTicketsSold(): number {
    return this._totalTicketsSold;
  }
}
