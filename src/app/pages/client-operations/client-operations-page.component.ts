import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ClientModuleApiService } from '../../clients/client-module-api.service';
import { ClientModule } from '../../clients/client.types';
import { DashboardMiniHubComponent } from '../../components/dashboard-mini-hub/dashboard-mini-hub.component';
import { IntegrationJobsTableComponent } from '../../components/integration-jobs-table/integration-jobs-table.component';
import { InterfaceJobsTableComponent } from '../../components/interface-jobs-table/interface-jobs-table.component';
import { TableCertificadosComponent } from '../../components/table-certificados/table-certificados.component';
import { MensajeriaGraficoComponent } from '../../components/mensajeria-grafico/mensajeria-grafico.component';
import { Certificado } from '../../models/certificado.model';
import { IntegrationJob } from '../../models/integration-job.model';
import { InterfaceJob } from '../../models/interface-job.model';
import { MensajeriaFlow } from '../../models/mensajeria.model';
import { MiniHubItem } from '../../models/mini-hub.model';
import { ClientDashboardComponent } from '../client-dashboard/client-dashboard.component';

@Component({
  selector: 'app-client-operations-page',
  imports: [
    ClientDashboardComponent,
    DashboardMiniHubComponent,
    IntegrationJobsTableComponent,
    InterfaceJobsTableComponent,
    TableCertificadosComponent,
    MensajeriaGraficoComponent
  ],
  templateUrl: './client-operations-page.component.html'
})
export class ClientOperationsPageComponent implements OnInit {
  private readonly api = inject(ClientModuleApiService);

  readonly clientId = input.required<ClientModule>();
  readonly summaryTitle = input.required<string>();
  readonly logoSrc = input<string>();

  readonly jobs = signal<IntegrationJob[]>([]);
  readonly interfaces = signal<InterfaceJob[]>([]);
  readonly certificados = signal<Certificado[]>([]);
  readonly mensajeria = signal<MensajeriaFlow[]>([]);

  readonly miniHubItems = computed<MiniHubItem[]>(() => {
    const jobs = this.jobs();
    const ifaces = this.interfaces();
    const certs = this.certificados();
    const flows = this.mensajeria();

    const topFlow = [...flows].sort((a, b) => b['Chargeable Msg'] - a['Chargeable Msg'])[0];
    const topValue = topFlow ? topFlow['Chargeable Msg'] : 0;
    const topName = topFlow ? topFlow['Integration Flow Name'] : '';

    const jobsFailed = jobs.filter((r) => r.Estado.toUpperCase().startsWith('FAILED')).length;
    const ifacesFailed = ifaces.filter((r) => r.estado.toLowerCase() === 'failed').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToExpire = certs
      .map((c) => Math.ceil((new Date(c.fechaExpiracion).getTime() - today.getTime()) / 86400000))
      .sort((a, b) => a - b)[0] ?? 0;

    return [
      { label: 'Top Mensajería', value: topValue, subtitle: topName, tone: 'primary' },
      { label: 'Jobs Failed', value: jobsFailed, tone: jobsFailed > 0 ? 'danger' : 'success' },
      { label: 'Interfaces Failed', value: ifacesFailed, tone: ifacesFailed > 0 ? 'danger' : 'success' },
      { label: 'Próx. Exp. Certificado', value: `${daysToExpire} días`, tone: daysToExpire <= 30 ? 'danger' : 'neutral' }
    ];
  });

  ngOnInit(): void {
    const client = this.clientId();

    forkJoin({
      jobs: this.api.getJobs(client),
      interfaces: this.api.getInterfaces(client),
      certificados: this.api.getCertificados(client),
      mensajeria: this.api.getMensajeria(client)
    }).subscribe(({ jobs, interfaces, certificados, mensajeria }) => {
      this.jobs.set(jobs);
      this.interfaces.set(interfaces);
      this.certificados.set(certificados);
      this.mensajeria.set(mensajeria);
    });
  }
}
