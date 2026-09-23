import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-card',
  imports: [RouterLink],
  templateUrl: './client-card.component.html'
})
export class ClientCardComponent {
  client = input.required<Client>();

  readonly successRate = computed(() => {
    const total = this.client().deployTotal;
    if (!total) {
      return 0;
    }
    return Math.round((this.client().deployOk / total) * 100);
  });

  readonly summaryMetrics = computed(() => {
    const c = this.client();
    return [
      {
        key: 'mensajeria',
        label: 'Top Mensajería',
        value: c.topMensajeria,
        hint: c.topMensajeriaFlow || 'Sin flujos',
        tone: 'primary' as const
      },
      {
        key: 'jobs',
        label: 'Jobs Failed',
        value: c.jobsFailed,
        hint: c.jobsFailed > 0 ? 'Requieren revisión' : 'Sin fallos',
        tone: (c.jobsFailed > 0 ? 'danger' : 'success') as 'danger' | 'success'
      },
      {
        key: 'interfaces',
        label: 'Interfaces Failed',
        value: c.interfacesFailed,
        hint: c.interfacesFailed > 0 ? 'Requieren revisión' : 'Sin fallos',
        tone: (c.interfacesFailed > 0 ? 'danger' : 'success') as 'danger' | 'success'
      },
      {
        key: 'cert',
        label: 'Próx. Exp. Cert.',
        value: `${c.certDaysToExpire} días`,
        hint: c.certDaysToExpire <= 30 ? 'Vence pronto' : 'Vigente',
        tone: (c.certDaysToExpire <= 30 ? 'danger' : 'neutral') as 'danger' | 'neutral'
      }
    ];
  });
}
