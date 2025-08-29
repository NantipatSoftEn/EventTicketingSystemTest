import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { DevModeToggleComponent } from './shared/components/dev-mode-toggle/dev-mode-toggle.component';
import { User } from './core/services/user.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, LayoutComponent, DevModeToggleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front-end';
  selectedUser: User | null = null;

  onUserSelected(user: User | null) {
    this.selectedUser = user;
    console.log('Selected user:', user);
  }
}
