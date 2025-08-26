import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevModeService } from '../../../core/services/dev-mode.service';

@Component({
  selector: 'app-dev-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dev-mode-toggle.component.html',
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
