import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { BookingService } from '../../core/services/booking.service';
import { Event } from '../../core/models/event.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  totalEvents = 0;
  totalRevenue = 0;
  totalBookings = 0;
  totalTicketsSold = 0;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.totalEvents = events.length;
        this.loadBookingStats(events);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  loadBookingStats(events: Event[]): void {
    const statsRequests = events.map(event =>
      this.bookingService.getBookingStats(event.id)
    );

    forkJoin(statsRequests).subscribe({
      next: (stats) => {
        this.totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
        this.totalBookings = stats.reduce((sum, stat) => sum + stat.totalBookings, 0);
        this.totalTicketsSold = stats.reduce((sum, stat) => sum + stat.totalTickets, 0);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading booking stats:', error);
        this.isLoading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
