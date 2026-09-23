import {
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { AppButtonComponent } from '../../components/app-button/app-button.component';
import { IntegrationJobsTableComponent } from '../../components/integration-jobs-table/integration-jobs-table.component';
import { InterfaceJobsTableComponent } from '../../components/interface-jobs-table/interface-jobs-table.component';
import { TableCertificadosComponent } from '../../components/table-certificados/table-certificados.component';
import { ClientApiService } from '../../clients/client-api.service';
import { DashboardPdfService } from '../../services/dashboard-pdf.service';

@Component({
  selector: 'app-client-dashboard',
  imports: [AppButtonComponent],
  templateUrl: './client-dashboard.component.html'
})
export class ClientDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly clientApi = inject(ClientApiService);
  private readonly pdfService = inject(DashboardPdfService);

  readonly clientId = input.required<string>();
  readonly logoSrc = input<string>();
  private readonly clientNameSignal = signal('Cliente');
  readonly exporting = signal(false);

  readonly clientName = computed(() => this.clientNameSignal());

  private readonly pdfRoot = viewChild.required<ElementRef<HTMLElement>>('pdfRoot');
  private readonly jobsTables = contentChildren(IntegrationJobsTableComponent, { descendants: true });
  private readonly interfaceTables = contentChildren(InterfaceJobsTableComponent, { descendants: true });
  private readonly certificadoTables = contentChildren(TableCertificadosComponent, {
    descendants: true
  });

  ngOnInit(): void {
    this.clientApi.getClients().subscribe({
      next: (clients) => {
        const client = clients.find((item) => item.id === this.clientId());
        this.clientNameSignal.set(client?.name ?? 'Cliente');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  async downloadPdf(): Promise<void> {
    if (this.exporting()) {
      return;
    }

    this.exporting.set(true);
    document.body.classList.add('pdf-exporting');

    const previousJobs = this.jobsTables().map((table) => table.expanded());
    const previousInterfaces = this.interfaceTables().map((table) => table.expanded());
    const previousCertificados = this.certificadoTables().map((table) => table.expanded());

    this.jobsTables().forEach((table) => table.setExpanded(true));
    this.interfaceTables().forEach((table) => table.setExpanded(true));
    this.certificadoTables().forEach((table) => table.setExpanded(true));

    try {
      await this.waitForRender();
      const stamp = new Date().toISOString().slice(0, 10);
      await this.pdfService.downloadElementAsPdf(
        this.pdfRoot().nativeElement,
        `dashboard-${this.clientId()}-${stamp}`
      );
    } finally {
      this.jobsTables().forEach((table, index) => table.setExpanded(previousJobs[index] ?? false));
      this.interfaceTables().forEach((table, index) =>
        table.setExpanded(previousInterfaces[index] ?? false)
      );
      this.certificadoTables().forEach((table, index) =>
        table.setExpanded(previousCertificados[index] ?? false)
      );
      document.body.classList.remove('pdf-exporting');
      this.exporting.set(false);
    }
  }

  private waitForRender(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 350);
      });
    });
  }
}
