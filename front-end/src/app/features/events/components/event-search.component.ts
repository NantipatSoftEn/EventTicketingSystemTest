import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventSearchFilter } from '../../../core/models';

@Component({
  selector: 'app-event-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-search.component.html',
  styles: []
})
export class EventSearchComponent {
  @Output() search = new EventEmitter<EventSearchFilter>();

  searchQuery = '';
  venueFilter = '';
  startDate = '';
  endDate = '';

  resultCount = signal<number | null>(null);

  onSearchChange(): void {
    const filter: EventSearchFilter = {};

    if (this.searchQuery.trim()) {
      filter.query = this.searchQuery.trim();
    }

    if (this.venueFilter.trim()) {
      filter.venue = this.venueFilter.trim();
    }

    if (this.startDate) {
      filter.startDate = new Date(this.startDate);
    }

    if (this.endDate) {
      filter.endDate = new Date(this.endDate);
    }

    this.search.emit(filter);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.venueFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.onSearchChange();
  }

  updateResultCount(count: number): void {
    this.resultCount.set(count);
  }
}
