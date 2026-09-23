import { Component, Input } from '@angular/core';
import { MiniHubItem } from '../../models/mini-hub.model';

export type { MiniHubItem };

@Component({
  selector: 'app-dashboard-mini-hub',
  standalone: true,
  templateUrl: './dashboard-mini-hub.component.html'
})
export class DashboardMiniHubComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) items: MiniHubItem[] = [];
}
