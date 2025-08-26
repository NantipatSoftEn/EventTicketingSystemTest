import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-create-event',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css'
})
export class CreateEventComponent {
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  eventForm = {
    title: '',
    description: '',
    venue: '',
    date: '',
    time: '',
    price: 0,
    totalTickets: 0,
    image: ''
  };

  categories = [];

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convert form data to Event format
    const eventData: Omit<Event, 'id' | 'createdAt'> = {
      title: this.eventForm.title,
      description: this.eventForm.description,
      venue: this.eventForm.venue,
      date: new Date(this.eventForm.date + 'T' + this.eventForm.time),
      time: this.eventForm.time,
      price: this.eventForm.price,
      totalTickets: this.eventForm.totalTickets,
      availableTickets: this.eventForm.totalTickets,
      image: this.eventForm.image || this.getDefaultImage(),
      isActive: true
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (createdEvent: Event) => {
        this.isLoading = false;
        this.successMessage = 'Event created successfully!';

        // Reset form
        this.resetForm();

        // Navigate to manage events after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/manage-events']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('Error creating event:', error);
        this.errorMessage = 'Failed to create event. Please try again.';
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.eventForm.title.trim() &&
      this.eventForm.description.trim() &&
      this.eventForm.venue.trim() &&
      this.eventForm.date &&
      this.eventForm.time &&
      this.eventForm.price > 0 &&
      this.eventForm.totalTickets > 0
    );
  }

  resetForm(): void {
    this.eventForm = {
      title: '',
      description: '',
      venue: '',
      date: '',
      time: '',
      price: 0,
      totalTickets: 0,
      image: ''
    };
  }

  getDefaultImage(): string {
    const images = [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1585699933707-4b823080deb9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  // Set minimum date to today
  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
