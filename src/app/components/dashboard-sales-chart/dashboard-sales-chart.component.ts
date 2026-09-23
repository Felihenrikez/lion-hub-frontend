import { Component, Input } from '@angular/core';
import { MonthlyPoint } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-sales-chart',
  standalone: true,
  templateUrl: './dashboard-sales-chart.component.html',
  styleUrl: './dashboard-sales-chart.component.scss'
})
export class DashboardSalesChartComponent {
  @Input({ required: true }) data: MonthlyPoint[] = [];

  get maxSales(): number {
    return Math.max(...this.data.map((point) => point.value), 1);
  }
}
