import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevModeService } from '../../../core/services/dev-mode.service';

@Component({
  selector: 'app-dev-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dev-mode-toggle bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700">Dev Mode:</span>
          <span class="text-sm" [class]="devModeService.isDevMode ? 'text-green-600 font-semibold' : 'text-blue-600 font-semibold'">
            {{ devModeService.isDevMode ? 'ON (Mock Data)' : 'OFF (Real API)' }}
          </span>
        </div>
        <button
          (click)="toggleDevMode()"
          class="px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200"
          [class]="devModeService.isDevMode
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
        >
          Toggle
        </button>
      </div>
      <div class="mt-2 text-xs text-gray-500">
        {{ devModeService.isDevMode
          ? 'Using mock data for development'
          : 'Fetching data from API at localhost:8000' }}
      </div>
    </div>
  `,
  styles: [`
    .dev-mode-toggle {
      position: sticky;
      top: 0;
      z-index: 10;
    }
  `]
})
export class DevModeToggleComponent {
  constructor(public devModeService: DevModeService) {}

  toggleDevMode(): void {
    this.devModeService.toggleDevMode();
    // Optionally reload the page or refresh data
    window.location.reload();
  }
}
