import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-lion-800 to-lion-500 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:from-lion-900 hover:to-lion-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lion-500 active:from-lion-950 active:to-[#0f79a8] disabled:cursor-not-allowed disabled:opacity-65"
      [class.w-full]="fullWidth()"
      [disabled]="isDisabled()"
      (click)="clicked.emit()"
    >
      <ng-content />
    </button>
  `,
})
export class AppButtonComponent {
  type = input<'button' | 'submit'>('button');
  isDisabled = input(false);
  fullWidth = input(false);
  clicked = output<void>();
}
