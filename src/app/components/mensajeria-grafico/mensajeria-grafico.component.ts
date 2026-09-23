import { Component, computed, input } from '@angular/core';
import { CanvasJSAngularChartsModule, CanvasJS } from '@canvasjs/angular-charts';
import { MensajeriaFlow } from '../../models/mensajeria.model';

CanvasJS.addColorSet('mensajeriaColors', [
  '#139ad3', '#0f4463', '#ffcb06', '#ce1249', '#3a943c',
  '#7f3e83', '#2078b6', '#df7f2e', '#812900', '#e3e3e3'
]);

@Component({
  selector: 'app-mensajeria-grafico',
  standalone: true,
  imports: [CanvasJSAngularChartsModule],
  templateUrl: './mensajeria-grafico.component.html'
})
export class MensajeriaGraficoComponent {
  data = input.required<MensajeriaFlow[]>();

  readonly chartOptions = computed(() => {
    const flows = this.data();
    const sorted = [...flows].sort((a, b) => b['Chargeable Msg'] - a['Chargeable Msg']);
    const top = sorted.slice(0, 10);

    const dataPoints = top.map(f => ({
      name: f['Integration Flow Name'],
      y: f['Chargeable Msg']
    }));

    return {
      animationEnabled: true,
      theme: 'light2',
      colorSet: 'mensajeriaColors',
      title: {},
      data: [{
        type: 'doughnut',
        indexLabel: '{name}: {y}',
        innerRadius: '70%',
        yValueFormatString: '#,###',
        dataPoints
      }]
    };
  });
}
