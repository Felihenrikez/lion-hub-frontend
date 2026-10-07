import { Component, computed, input, output } from '@angular/core';
import {
  COMPONENT_TYPES,
  FLOW_STATUSES,
  HUB_CLIENTS,
  clientLabel,
  orderedCounts,
  statusLabel
} from '../../gobierno/gobierno.format';
import { FlowSummary } from '../../gobierno/gobierno.types';

@Component({
  selector: 'app-summary-board',
  templateUrl: './summary-board.component.html'
})
export class SummaryBoardComponent {
  readonly summary = input.required<FlowSummary>();
  readonly activeClient = input('');
  readonly activeStatus = input('');
  readonly activeComponent = input('');
  readonly selectClient = output<string>();
  readonly selectStatus = output<string>();
  readonly selectComponent = output<string>();

  readonly statusLabel = statusLabel;
  readonly clientLabel = clientLabel;

  readonly statuses = computed(() => orderedCounts(this.summary().byStatus, FLOW_STATUSES));
  readonly clients = computed(() =>
    orderedCounts(
      this.summary().byClient,
      HUB_CLIENTS.map((client) => client.id)
    )
  );
  readonly components = computed(() => orderedCounts(this.summary().byComponentType, COMPONENT_TYPES));

  readonly empty = computed(
    () => !this.statuses().length && !this.clients().length && !this.components().length
  );
}
