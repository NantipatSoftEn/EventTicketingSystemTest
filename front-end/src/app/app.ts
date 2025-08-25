import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Profile } from './profile/profile';
import { ZardAccordionComponent } from './shared/components/accordion/accordion.component';
import { ZardAccordionItemComponent } from './shared/components/accordion/accordion-item.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Profile],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('EventTicketingSystemTest');
}
