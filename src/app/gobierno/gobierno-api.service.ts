import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from '../services/api-config.service';
import {
  AuditLog,
  DataSource,
  FlowListQuery,
  FlowListResponse,
  FlowSummary,
  ImportResult,
  IntegrationFlow,
  RetireFlow,
  UpdateGovernance
} from './gobierno.types';

@Injectable({ providedIn: 'root' })
export class GobiernoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  listFlows(query: FlowListQuery = {}): Observable<FlowListResponse> {
    return this.http
      .get<FlowListResponse>(this.apiConfig.catalogUrl('/integration-flows'), {
        params: this.toParams(query)
      })
      .pipe(
        map((response) => ({
          page: response.page ?? query.page ?? 1,
          limit: response.limit ?? query.limit ?? 20,
          total: response.total ?? 0,
          items: (response.items ?? []).map((item) => this.normalizeFlow(item))
        }))
      );
  }

  getSummary(clientId?: string): Observable<FlowSummary> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http
      .get<FlowSummary>(this.apiConfig.catalogUrl('/integration-flows/resumen'), { params })
      .pipe(
        map((summary) => ({
          byStatus: summary.byStatus ?? {},
          byClient: summary.byClient ?? {},
          byComponentType: summary.byComponentType ?? {}
        }))
      );
  }

  getFlow(id: string): Observable<IntegrationFlow> {
    return this.http
      .get<IntegrationFlow>(this.flowUrl(id))
      .pipe(map((flow) => this.normalizeFlow(flow)));
  }

  getFlowAudit(id: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.flowUrl(id, '/audit')).pipe(
      map((logs) =>
        (logs ?? []).map((log) => ({
          ...log,
          changes: log.changes ?? []
        }))
      )
    );
  }

  updateFlow(id: string, body: UpdateGovernance): Observable<IntegrationFlow> {
    return this.http
      .patch<IntegrationFlow>(this.flowUrl(id), body)
      .pipe(map((flow) => this.normalizeFlow(flow)));
  }

  retireFlow(id: string, body: RetireFlow): Observable<IntegrationFlow> {
    return this.http
      .post<IntegrationFlow>(this.flowUrl(id, '/retirar'), body)
      .pipe(map((flow) => this.normalizeFlow(flow)));
  }

  importZip(formData: FormData): Observable<ImportResult> {
    return this.http.post<ImportResult>(this.apiConfig.catalogUrl('/imports/zip'), formData);
  }

  private flowUrl(id: string, suffix = ''): string {
    return this.apiConfig.catalogUrl(`/integration-flows/${encodeURIComponent(id)}${suffix}`);
  }

  private toParams(query: FlowListQuery): HttpParams {
    let params = new HttpParams();
    const entries: [string, string | number | undefined][] = [
      ['clientId', query.clientId],
      ['environment', query.environment],
      ['status', query.status],
      ['componentType', query.componentType],
      ['sender', query.sender],
      ['receiver', query.receiver],
      ['dependencyKind', query.dependencyKind],
      ['q', query.q],
      ['page', query.page],
      ['limit', query.limit]
    ];

    for (const [key, value] of entries) {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }

    return params;
  }

  private normalizeFlow(flow: IntegrationFlow): IntegrationFlow {
    const execution = flow.execution ?? {
      mode: null,
      frequency: '',
      timeZone: '',
      source: 'manual' as DataSource
    };

    return {
      ...flow,
      environments: (flow.environments ?? []).map((environment) => ({
        ...environment,
        sender: environment.sender ?? {
          adapterType: '',
          address: '',
          timeZone: '',
          timeZoneIana: '',
          observesDaylightSaving: false,
          scheduleDescription: ''
        },
        receivers: environment.receivers ?? []
      })),
      components: (flow.components ?? []).map((component) => ({
        ...component,
        config: component.config ?? {}
      })),
      dependencies: flow.dependencies ?? [],
      versionHistory: flow.versionHistory ?? [],
      provenance: flow.provenance ?? {
        lastZip: '',
        lastImportedAt: '',
        importedBy: ''
      },
      execution
    };
  }
}
