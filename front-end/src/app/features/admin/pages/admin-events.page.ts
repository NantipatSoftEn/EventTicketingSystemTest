import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Events Management</h1>
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <p class="text-gray-600">Admin Events Management functionality will be implemented here.</p>
        </div>
      </div>
    </div>
  `
})
export class AdminEventsPageComponent {}
