import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styles: []
})
export class ErrorMessageComponent {
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() title!: string;
  @Input() message?: string | null;
  @Input() dismissible: boolean = true;
  @Output() dismiss = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }
}
