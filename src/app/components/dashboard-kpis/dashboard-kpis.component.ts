import { Component, Input } from '@angular/core';
import { Kpi } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-kpis',
  standalone: true,
  templateUrl: './dashboard-kpis.component.html',
  styleUrl: './dashboard-kpis.component.scss'
})
export class DashboardKpisComponent {
  @Input({ required: true }) kpis: Kpi[] = [];

  getTrendSymbol(trend: 'up' | 'down' | 'flat'): string {
    if (trend === 'up') {
      return '▲';
    }
    if (trend === 'down') {
      return '▼';
    }
    return '●';
  }
}
