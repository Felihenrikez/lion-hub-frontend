import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientModule } from './client.types';
import { Certificado } from '../models/certificado.model';
import { ChartResponse } from '../models/chart-data.model';
import { ClientDashboard } from '../models/dashboard.model';
import { IntegrationJob } from '../models/integration-job.model';
import { InterfaceJob } from '../models/interface-job.model';
import { MensajeriaFlow } from '../models/mensajeria.model';
import { ApiConfigService } from '../services/api-config.service';

@Injectable({ providedIn: 'root' })
export class ClientModuleApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  getDashboard(client: ClientModule): Observable<ClientDashboard> {
    return this.http.get<ClientDashboard>(this.moduleUrl(client, '/dashboard'));
  }

  getJobs(client: ClientModule): Observable<IntegrationJob[]> {
    return this.http.get<IntegrationJob[]>(this.moduleUrl(client, '/jobs'));
  }

  getInterfaces(client: ClientModule): Observable<InterfaceJob[]> {
    return this.http.get<InterfaceJob[]>(this.moduleUrl(client, '/interfaces'));
  }

  getChart(client: ClientModule): Observable<ChartResponse> {
    return this.http.get<ChartResponse>(this.moduleUrl(client, '/chart'));
  }

  getMensajeria(client: ClientModule): Observable<MensajeriaFlow[]> {
    return this.http.get<MensajeriaFlow[]>(this.moduleUrl(client, '/mensajeria'));
  }

  getCertificados(client: ClientModule): Observable<Certificado[]> {
    return this.http.get<Certificado[]>(this.moduleUrl(client, '/certificados'));
  }

  private moduleUrl(client: ClientModule, path: string): string {
    return this.apiConfig.url(`/${client}${path}`);
  }
}
