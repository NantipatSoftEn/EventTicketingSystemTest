import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketValidationService } from '../../../shared/services/ticket-validation.service';
import {
  TicketValidationRequest,
  TicketValidationResponse
} from '../../../shared/models/ticket-validation.model';

@Component({
  selector: 'app-ticket-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-validation.component.html',
  styleUrls: ['./ticket-validation.component.css']
})
export class TicketValidationComponent implements OnInit {
  ticketCode: string = '';
  validationResult: TicketValidationResponse | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(private ticketValidationService: TicketValidationService) { }

  ngOnInit(): void {
    // Clear any previous state
    this.clearResults();
  }

  /**
   * Validate ticket by code
   */
  validateTicket(): void {
    if (!this.ticketCode.trim()) {
      this.error = 'Please enter a ticket code';
      return;
    }

    this.loading = true;
    this.error = '';
    this.validationResult = null;

    const request: TicketValidationRequest = {
      ticket_code: this.ticketCode.trim()
    };

    this.ticketValidationService.validateTicket(request).subscribe({
      next: (response) => {
        this.validationResult = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.detail || 'An error occurred while validating the ticket';
        this.loading = false;
      }
    });
  }

  /**
   * Use the validated ticket
   */
  useTicket(): void {
    if (!this.validationResult) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.ticketValidationService.useTicket(this.validationResult.ticket_code).subscribe({
      next: (response) => {
        this.validationResult = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.detail || 'An error occurred while using the ticket';
        this.loading = false;
      }
    });
  }

  /**
   * Clear all results and reset form
   */
  clearResults(): void {
    this.ticketCode = '';
    this.validationResult = null;
    this.error = '';
    this.loading = false;
  }

  /**
   * Get status color class based on ticket status
   */
  getStatusColorClass(): string {
    if (!this.validationResult) return '';

    switch (this.validationResult.status) {
      case 'active':
        return 'text-green-600';
      case 'used':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get validation result color class
   */
  getValidationColorClass(): string {
    if (!this.validationResult) return '';
    return this.validationResult.is_valid ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
