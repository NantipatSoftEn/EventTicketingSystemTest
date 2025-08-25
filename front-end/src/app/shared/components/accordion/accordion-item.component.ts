import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, input, signal, ViewEncapsulation } from '@angular/core';
import { ClassValue } from 'clsx';

import { ZardAccordionComponent } from './accordion.component';

@Component({
  selector: 'z-accordion-item',
  exportAs: 'zAccordionItem',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './accordion.html',
})
export class ZardAccordionItemComponent {
  readonly zTitle = input<string>('');
  readonly zValue = input<string>('');
  readonly class = input<ClassValue>('');

  private isOpenSignal = signal(false);

  accordion?: ZardAccordionComponent;

  constructor(private cdr: ChangeDetectorRef) {}

  isOpen = computed(() => this.isOpenSignal());

  setOpen(open: boolean): void {
    this.isOpenSignal.set(open);
    this.cdr.markForCheck();
  }

  toggle(): void {
    if (this.accordion) {
      this.accordion.toggleItem(this);
    } else {
      this.setOpen(!this.isOpen());
    }
  }
}
