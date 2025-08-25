import { Routes } from '@angular/router';

export const bookingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/booking-list.page').then(m => m.BookingListPageComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/booking-detail.page').then(m => m.BookingDetailPageComponent)
  }
];
