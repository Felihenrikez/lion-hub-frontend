export interface ChartDataPoint {
  date: string;
  messages: number;
}

export interface ChartConfig {
  title: string;
  xAxis: string;
  yAxis: string;
  type: string;
}

export interface ChartResponse {
  chartData: ChartDataPoint[];
  chartConfig: ChartConfig;
}
