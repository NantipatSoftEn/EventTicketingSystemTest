import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styles: []
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  showUserMenu = false;
  showMobileMenu = false;

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getCurrentUserInitial(): string {
    const user = this.authService.getCurrentUser();
    return user?.firstName?.charAt(0) || 'U';
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.firstName || 'User';
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.router.navigate(['/']);
  }
}
