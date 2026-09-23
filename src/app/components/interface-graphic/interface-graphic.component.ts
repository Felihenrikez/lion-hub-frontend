import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ChartResponse } from '../../models/chart-data.model';

@Component({
  selector: 'app-interface-graphic',
  standalone: true,
  imports: [CanvasJSAngularChartsModule],
  templateUrl: './interface-graphic.component.html',
  styleUrl: './interface-graphic.component.scss'
})
export class InterfaceGraphicComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) data!: ChartResponse;
  @ViewChild('chartComponent') chartComponent: any;

  private chartRef: any = null;

  get chartOptions() {
    const dataPoints = this.data.chartData.map(d => ({
      label: d.date.substring(5),
      y: d.messages
    }));

    return {
      animationEnabled: true,
      theme: 'light2',
      title: { text: this.data.chartConfig.title },
      axisX: {
        title: this.data.chartConfig.xAxis,
        labelAngle: -45,
        labelFontSize: 11
      },
      axisY: {
        title: this.data.chartConfig.yAxis,
        includeZero: true,
        labelFormatter: (e: any) => {
          if (e.value >= 1000) return (e.value / 1000) + 'K';
          return e.value;
        }
      },
      data: [{
        type: 'column',
        color: '#139ad3',
        yValueFormatString: '#,###',
        dataPoints
      }]
    };
  }

  onChartInstance(chart: any): void {
    this.chartRef = chart;
  }

  ngAfterViewInit(): void {
    if (this.chartComponent) {
      this.chartComponent.ngOnDestroy = () => {};
    }
  }

  ngOnDestroy(): void {
    if (this.chartRef) {
      try {
        this.chartRef.destroy();
      } catch {
        // CanvasJS bug - ignore
      }
      this.chartRef = null;
    }
  }
}
