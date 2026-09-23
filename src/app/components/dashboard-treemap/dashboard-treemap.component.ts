import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TreemapChart, TreemapItem } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-treemap',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './dashboard-treemap.component.html',
  styleUrl: './dashboard-treemap.component.scss'
})
export class DashboardTreemapComponent {
  @Input({ required: true }) chart!: TreemapChart;

  getAreaPercent(item: TreemapItem): number {
    const total = this.chart.items.reduce((sum, current) => sum + current.value, 0);
    if (total === 0) {
      return 0;
    }
    return (item.value / total) * 100;
  }
}
