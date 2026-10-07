import { Component, input, output } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { AppButtonComponent } from '../app-button/app-button.component';

@Component({
  selector: 'app-hub-header',
  imports: [RouterLink, AppButtonComponent],
  templateUrl: './hub-header.component.html'
})
export class HubHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly backLink = input<string | null>(null);
  readonly backLabel = input('Inicio');
  readonly backQuery = input<Params | null>(null);
  readonly logout = output<void>();
}
