import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  mockLogin(userType: 'user' | 'admin'): void {
    this.authService.mockLogin(userType).subscribe({
      next: () => {
        this.closeMobileMenu();
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
