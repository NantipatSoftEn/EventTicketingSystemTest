import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../../core/services';
import { Event, CreateEventRequest } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/ui/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/ui/error-message.component';

@Component({
  selector: 'app-admin-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ErrorMessageComponent],
  templateUrl: './admin-event-form.page.html',
  styleUrls: ['./admin-event-form.page.css']
})
export class AdminEventFormPageComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  eventForm!: FormGroup;
  isEditMode = false;
  eventId: number | null = null;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  minDateTime = this.getMinDateTime();

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.eventForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      venue: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      dateTime: ['', [
        Validators.required,
        this.futureDateValidator
      ]],
      capacity: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(100000)
      ]],
      price: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(10000)
      ]],
      status: ['ACTIVE', Validators.required]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.eventId = +id;
      this.loadEvent(this.eventId);
    }
  }

  private loadEvent(id: number): void {
    this.eventService.getEvent(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.populateForm(response.data);
        } else {
          this.errorMessage.set(response.message || 'Failed to load event');
        }
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.errorMessage.set('Failed to load event. Please try again.');
      }
    });
  }

  private populateForm(event: Event): void {
    // Convert the date to the format expected by datetime-local input
    const eventDate = new Date(event.date);
    const localDateTime = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      venue: event.venue,
      dateTime: localDateTime,
      capacity: event.totalTickets,
      price: event.price,
      status: event.isActive ? 'ACTIVE' : 'CANCELLED'
    });
  }

  private futureDateValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const now = new Date();

    if (selectedDate <= now) {
      return { futureDate: true };
    }

    return null;
  }

  private getMinDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.eventForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.eventForm.value;

      // Create the event request object
      const eventRequest: CreateEventRequest = {
        title: formValue.title,
        description: formValue.description,
        venue: formValue.venue,
        date: new Date(formValue.dateTime),
        totalTickets: formValue.capacity,
        price: formValue.price
      };

      if (this.isEditMode && this.eventId) {
        // Update existing event
        this.eventService.updateEvent(this.eventId, eventRequest).subscribe({
          next: (response) => {
            this.isSubmitting.set(false);
            if (response.success) {
              this.successMessage.set('Event updated successfully!');
              setTimeout(() => {
                this.router.navigate(['/admin/events']);
              }, 2000);
            } else {
              this.errorMessage.set(response.message || 'Failed to update event');
            }
          },
          error: (error) => {
            this.isSubmitting.set(false);
            console.error('Error updating event:', error);
            this.errorMessage.set('Failed to update event. Please try again.');
          }
        });
      } else {
        // Create new event
        this.eventService.createEvent(eventRequest).subscribe({
          next: (response) => {
            this.isSubmitting.set(false);
            if (response.success) {
              this.successMessage.set('Event created successfully!');
              setTimeout(() => {
                this.router.navigate(['/admin/events']);
              }, 2000);
            } else {
              this.errorMessage.set(response.message || 'Failed to create event');
            }
          },
          error: (error) => {
            this.isSubmitting.set(false);
            console.error('Error creating event:', error);
            this.errorMessage.set('Failed to create event. Please try again.');
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.eventForm);
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/events']);
  }

  onReset(): void {
    if (this.isEditMode && this.eventId) {
      // Reload the original event data
      this.loadEvent(this.eventId);
    } else {
      // Reset to empty form
      this.eventForm.reset();
      this.eventForm.patchValue({
        status: 'ACTIVE'
      });
    }
    this.clearMessages();
  }

  formatPreviewDate(dateTimeValue: string): string {
    if (!dateTimeValue) return '';

    const date = new Date(dateTimeValue);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  clearSuccess(): void {
    this.successMessage.set(null);
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
