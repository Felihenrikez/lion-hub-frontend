import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProductRow } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-product-table',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './dashboard-product-table.component.html',
  styleUrl: './dashboard-product-table.component.scss'
})
export class DashboardProductTableComponent {
  @Input({ required: true }) rows: ProductRow[] = [];
}
