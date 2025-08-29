import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { EventService } from './event.service';
import { BookingService } from './booking.service';
import { Event } from '../models/event.model';

export interface AdminDashboardStats {
  totalEvents: number;
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStateService {
  private readonly initialState: AdminDashboardStats = {
    totalEvents: 0,
    totalRevenue: 0,
    totalBookings: 0,
    totalTicketsSold: 0,
    isLoading: false
  };

  private statsSubject = new BehaviorSubject<AdminDashboardStats>(this.initialState);
  public stats$ = this.statsSubject.asObservable();

  constructor(
    private eventService: EventService,
    private bookingService: BookingService
  ) {}

  get currentStats(): AdminDashboardStats {
    return this.statsSubject.value;
  }

  setLoading(isLoading: boolean): void {
    this.updateStats({ isLoading });
  }

  private updateStats(partialStats: Partial<AdminDashboardStats>): void {
    const currentStats = this.statsSubject.value;
    const newStats = { ...currentStats, ...partialStats };
    this.statsSubject.next(newStats);
  }

  loadDashboardStats(): void {
    this.setLoading(true);

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.updateStats({ totalEvents: events.length });
        this.loadBookingStats(events);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.setLoading(false);
      }
    });
  }

  private loadBookingStats(events: Event[]): void {
    const statsRequests = events.map(event =>
      this.bookingService.getBookingStats(event.id)
    );

    forkJoin(statsRequests).subscribe({
      next: (stats) => {
        const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
        const totalBookings = stats.reduce((sum, stat) => sum + stat.totalBookings, 0);
        const totalTicketsSold = stats.reduce((sum, stat) => sum + stat.totalTickets, 0);

        this.updateStats({
          totalRevenue,
          totalBookings,
          totalTicketsSold,
          isLoading: false
        });
      },
      error: (error) => {
        console.error('Error loading booking stats:', error);
        this.setLoading(false);
      }
    });
  }

  refreshStats(): void {
    this.loadDashboardStats();
  }

  resetStats(): void {
    this.statsSubject.next(this.initialState);
  }
}
