import { Component, Input } from '@angular/core';
import { HeatmapChart } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-heatmap',
  standalone: true,
  templateUrl: './dashboard-heatmap.component.html',
  styleUrl: './dashboard-heatmap.component.scss'
})
export class DashboardHeatmapComponent {
  @Input({ required: true }) chart!: HeatmapChart;

  getCellOpacity(value: number): number {
    const normalized = Math.max(0, Math.min(1, value / 100));
    return 0.2 + normalized * 0.8;
  }
}
