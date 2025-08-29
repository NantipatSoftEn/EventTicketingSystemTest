import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevModeService } from '../../../core/services/dev-mode.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dev-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dev-mode-toggle.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DevModeToggleComponent {
  isDevMode$: Observable<boolean>;

  constructor(private devModeService: DevModeService) {
    this.isDevMode$ = this.devModeService.isDevMode$;
  }

  get isDevMode(): boolean {
    return this.devModeService.isDevMode;
  }

  toggleDevMode(): void {
    this.devModeService.toggleDevMode();
    window.location.reload();
  }
}
