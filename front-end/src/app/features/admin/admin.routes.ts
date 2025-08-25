import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/admin-dashboard.page').then(m => m.AdminDashboardPageComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/admin-events.page').then(m => m.AdminEventsPageComponent)
  },
  // {
  //   path: 'events/new',
  //   loadComponent: () => import('./pages/admin-event-form.page').then(m => m.AdminEventFormPageComponent)
  // },
  // {
  //   path: 'events/:id/edit',
  //   loadComponent: () => import('./pages/admin-event-form.page').then(m => m.AdminEventFormPageComponent)
  // }
];
