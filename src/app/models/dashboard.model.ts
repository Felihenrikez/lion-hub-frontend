export interface Kpi {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

export interface ProductRow {
  product: string;
  volume: number;
  revenue: number;
  compliance: number;
}

export interface HeatmapSeries {
  name: string;
  values: number[];
}

export interface HeatmapChart {
  title: string;
  columns: string[];
  series: HeatmapSeries[];
}

export interface TreemapItem {
  name: string;
  value: number;
  color: string;
}

export interface TreemapChart {
  title: string;
  items: TreemapItem[];
}

export interface ClientDashboard {
  kpis: Kpi[];
  monthlySales: MonthlyPoint[];
  productTable: ProductRow[];
  heatmapChart?: HeatmapChart;
  treemapChart?: TreemapChart;
}
