import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, finalize, switchMap } from 'rxjs';
import { SummaryBoardComponent } from '../../components/gobierno/summary-board.component';
import { ZipImportComponent } from '../../components/gobierno/zip-import.component';
import { AppButtonComponent } from '../../components/app-button/app-button.component';
import { HubHeaderComponent } from '../../components/hub-header/hub-header.component';
import { GobiernoApiService } from '../../gobierno/gobierno-api.service';
import {
  COMPONENT_TYPES,
  DEPENDENCY_KINDS,
  ENVIRONMENTS,
  FLOW_STATUSES,
  clientLabel,
  criticalityLabel,
  criticalityTone,
  formatDateTime,
  isEnvironmentPresent,
  readApiError,
  statusLabel,
  statusTone
} from '../../gobierno/gobierno.format';
import {
  DependencyKind,
  Environment,
  FlowListQuery,
  FlowStatus,
  FlowSummary,
  IntegrationFlow
} from '../../gobierno/gobierno.types';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gobierno-list-page',
  imports: [
    FormsModule,
    RouterLink,
    HubHeaderComponent,
    AppButtonComponent,
    SummaryBoardComponent,
    ZipImportComponent
  ],
  templateUrl: './gobierno-list-page.component.html'
})
export class GobiernoListPageComponent {
  private readonly api = inject(GobiernoApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly filters$ = new Subject<FlowListQuery>();

  readonly environments = ENVIRONMENTS;
  readonly statuses = FLOW_STATUSES;
  readonly dependencyKinds = DEPENDENCY_KINDS;
  readonly componentTypes = COMPONENT_TYPES;
  readonly statusLabel = statusLabel;
  readonly statusTone = statusTone;
  readonly criticalityLabel = criticalityLabel;
  readonly criticalityTone = criticalityTone;
  readonly clientLabel = clientLabel;
  readonly formatDateTime = formatDateTime;
  readonly isPresent = isEnvironmentPresent;

  readonly summary = signal<FlowSummary | null>(null);
  readonly summaryError = signal('');
  readonly items = signal<IntegrationFlow[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly showImport = signal(false);
  readonly listQuery = signal<Params>({});

  readonly clientOptions = computed(() => {
    const ids = new Set<string>(['embonor', 'embol', 'polpaico', 'cial']);
    for (const id of Object.keys(this.summary()?.byClient ?? {})) {
      ids.add(id);
    }
    return [...ids];
  });

  q = '';
  clientId = '';
  environment = '';
  status = '';
  componentType = '';
  sender = '';
  receiver = '';
  dependencyKind = '';
  page = 1;
  limit = 20;

  private activeQuery: FlowListQuery = { page: 1, limit: 20 };

  constructor() {
    this.filters$
      .pipe(
        switchMap((query) => {
          this.loading.set(true);
          this.errorMessage.set('');
          return this.api.listFlows(query).pipe(
            catchError((error: unknown) => {
              this.items.set([]);
              this.total.set(0);
              this.errorMessage.set(readApiError(error, 'No se pudo cargar el catálogo.'));
              return EMPTY;
            }),
            finalize(() => this.loading.set(false))
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((response) => {
        this.items.set(response.items);
        this.total.set(response.total);
        this.page = response.page;
        this.limit = response.limit;
      });

    this.filters$
      .pipe(
        switchMap((query) => {
          this.summaryError.set('');
          return this.api.getSummary(query.clientId).pipe(
            catchError((error: unknown) => {
              this.summary.set(null);
              this.summaryError.set(readApiError(error, 'No se pudo cargar el resumen.'));
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((summary) => this.summary.set(summary));

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.filters$.next(this.readParams(params));
    });
  }

  pageCount(): number {
    return Math.max(1, Math.ceil(this.total() / Math.max(this.limit, 1)));
  }

  apply(): void {
    this.page = 1;
    this.navigate();
  }

  clear(): void {
    this.router.navigate(['/gobierno']);
  }

  toggleClient(clientId: string): void {
    this.clientId = this.clientId === clientId ? '' : clientId;
    this.page = 1;
    this.navigate();
  }

  toggleStatus(status: string): void {
    this.status = this.status === status ? '' : status;
    this.page = 1;
    this.navigate();
  }

  toggleComponent(componentType: string): void {
    this.componentType = this.componentType === componentType ? '' : componentType;
    this.page = 1;
    this.navigate();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pageCount()) {
      return;
    }

    this.page = page;
    this.navigate();
  }

  changeLimit(event: Event): void {
    this.limit = Math.min(200, positiveInt((event.target as HTMLSelectElement).value, 20));
    this.page = 1;
    this.navigate();
  }

  reload(): void {
    this.filters$.next(this.activeQuery);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private navigate(): void {
    this.router.navigate(['/gobierno'], { queryParams: this.toParams() });
  }

  private readParams(params: ParamMap): FlowListQuery {
    this.page = positiveInt(params.get('page'), 1);
    this.limit = Math.min(200, positiveInt(params.get('limit'), 20));
    this.q = params.get('q') ?? '';
    this.clientId = (params.get('clientId') ?? '').toLowerCase();
    this.environment = asEnvironment(params.get('environment'));
    this.status = asStatus(params.get('status'));
    this.componentType = params.get('componentType') ?? '';
    this.sender = params.get('sender') ?? '';
    this.receiver = params.get('receiver') ?? '';
    this.dependencyKind = asDependency(params.get('dependencyKind'));

    const query = this.toQuery();
    this.activeQuery = query;
    this.listQuery.set(this.toParams());
    return query;
  }

  private toQuery(): FlowListQuery {
    const query: FlowListQuery = {
      page: this.page,
      limit: this.limit
    };
    const clientId = this.clientId.trim().toLowerCase();
    const environment = asEnvironment(this.environment);
    const status = asStatus(this.status);
    const dependencyKind = asDependency(this.dependencyKind);

    if (clientId) {
      query.clientId = clientId;
    }
    if (environment) {
      query.environment = environment;
    }
    if (status) {
      query.status = status;
    }
    if (this.componentType.trim()) {
      query.componentType = this.componentType.trim();
    }
    if (this.sender.trim()) {
      query.sender = this.sender.trim();
    }
    if (this.receiver.trim()) {
      query.receiver = this.receiver.trim();
    }
    if (dependencyKind) {
      query.dependencyKind = dependencyKind;
    }
    if (this.q.trim()) {
      query.q = this.q.trim();
    }

    return query;
  }

  private toParams(): Params {
    const query = this.toQuery();
    const params: Params = {};

    if (query.clientId) {
      params['clientId'] = query.clientId;
    }
    if (query.environment) {
      params['environment'] = query.environment;
    }
    if (query.status) {
      params['status'] = query.status;
    }
    if (query.componentType) {
      params['componentType'] = query.componentType;
    }
    if (query.sender) {
      params['sender'] = query.sender;
    }
    if (query.receiver) {
      params['receiver'] = query.receiver;
    }
    if (query.dependencyKind) {
      params['dependencyKind'] = query.dependencyKind;
    }
    if (query.q) {
      params['q'] = query.q;
    }
    if ((query.page ?? 1) > 1) {
      params['page'] = String(query.page);
    }
    if ((query.limit ?? 20) !== 20) {
      params['limit'] = String(query.limit);
    }

    return params;
  }
}

function positiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function asEnvironment(value: string | null): Environment | '' {
  return value === 'DEV' || value === 'QAS' || value === 'PRD' ? value : '';
}

function asStatus(value: string | null): FlowStatus | '' {
  return (FLOW_STATUSES as readonly string[]).includes(value ?? '') ? (value as FlowStatus) : '';
}

function asDependency(value: string | null): DependencyKind | '' {
  return (DEPENDENCY_KINDS as readonly string[]).includes(value ?? '') ? (value as DependencyKind) : '';
}
