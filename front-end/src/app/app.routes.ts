import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/components/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home.page').then(m => m.HomePageComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/events/pages/event-list.page').then(m => m.EventListPageComponent)
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./features/events/pages/event-detail.page').then(m => m.EventDetailPageComponent)
      },
      {
        path: 'bookings',
        loadChildren: () => import('./features/bookings/bookings.routes').then(m => m.bookingRoutes)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
      },
      // Fallback route
      {
        path: '**',
        redirectTo: '/home'
      }
    ]
  }
];
