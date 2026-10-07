import { Component, computed, input } from '@angular/core';
import { architectureRoleLabel, buildArchitecture } from '../../gobierno/gobierno.format';
import { Environment, IntegrationFlow } from '../../gobierno/gobierno.types';

@Component({
  selector: 'app-architecture-flow',
  templateUrl: './architecture-flow.component.html'
})
export class ArchitectureFlowComponent {
  readonly flow = input.required<IntegrationFlow>();
  readonly environment = input.required<Environment>();
  readonly roleLabel = architectureRoleLabel;

  readonly nodes = computed(() => buildArchitecture(this.flow(), this.environment()));
}
