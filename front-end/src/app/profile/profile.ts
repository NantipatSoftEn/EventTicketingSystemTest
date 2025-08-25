import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: 'January 2024',
    eventsAttended: 12,
    ticketsBooked: 28
  };
}
