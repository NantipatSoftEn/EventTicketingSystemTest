import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { EventListComponent } from './features/events/event-list.component';
import { EventDetailComponent } from './features/events/event-detail.component';
import { UserDashboardComponent } from './features/dashboard/user-dashboard.component';
import { AdminPanelComponent } from './features/admin/admin-panel.component';
import { CreateEventComponent } from './features/admin/create-event/create-event.component';
import { ManageEventsComponent } from './features/admin/manage-events/manage-events.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'my-bookings', component: UserDashboardComponent },
  {
    path: 'admin',
    component: AdminPanelComponent,
    children: [
      { path: 'create-event', component: CreateEventComponent },
      { path: 'manage-events', component: ManageEventsComponent }
    ]
  },
  { path: '**', redirectTo: '/home' }
];
