import { Component, computed, input, output } from '@angular/core';
import { ENVIRONMENTS, formatDateTime, sourceLabel } from '../../gobierno/gobierno.format';
import { Environment, EnvironmentConfig } from '../../gobierno/gobierno.types';

@Component({
  selector: 'app-environment-board',
  templateUrl: './environment-board.component.html'
})
export class EnvironmentBoardComponent {
  readonly environments = input.required<EnvironmentConfig[]>();
  readonly selected = input.required<Environment>();
  readonly selectedChange = output<Environment>();

  readonly formatDateTime = formatDateTime;
  readonly sourceLabel = sourceLabel;
  readonly tabs = ENVIRONMENTS;

  readonly current = computed(
    () => this.environments().find((item) => item.environment === this.selected()) ?? null
  );

  isPresent(environment: Environment): boolean {
    return this.environments().some((item) => item.environment === environment && item.present);
  }
}
