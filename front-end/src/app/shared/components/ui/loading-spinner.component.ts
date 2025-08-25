import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styles: []
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: string = '#4F46E5';
  @Input() text?: string;
  @Input() containerClass: string = 'p-8';

  get spinnerClass(): string {
    const sizeClasses = {
      sm: 'h-6 w-6',
      md: 'h-10 w-10',
      lg: 'h-16 w-16'
    };
    return sizeClasses[this.size];
  }
}
