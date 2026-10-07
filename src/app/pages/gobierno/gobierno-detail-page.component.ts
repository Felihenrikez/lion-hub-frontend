import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, catchError, filter, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { AppButtonComponent } from '../../components/app-button/app-button.component';
import { ArchitectureFlowComponent } from '../../components/gobierno/architecture-flow.component';
import { AuditLogComponent } from '../../components/gobierno/audit-log.component';
import { EnvironmentBoardComponent } from '../../components/gobierno/environment-board.component';
import { GovernanceFormComponent } from '../../components/gobierno/governance-form.component';
import { HubHeaderComponent } from '../../components/hub-header/hub-header.component';
import { GobiernoApiService } from '../../gobierno/gobierno-api.service';
import {
  ENVIRONMENTS,
  clientLabel,
  criticalityLabel,
  criticalityTone,
  dependencyLabel,
  displayText,
  executionLabel,
  formatDateTime,
  isEnvironmentPresent,
  preferredEnvironment,
  readApiError,
  roleLabel,
  sourceLabel,
  statusLabel,
  statusTone
} from '../../gobierno/gobierno.format';
import {
  AuditLog,
  Environment,
  IntegrationFlow,
  UpdateGovernance
} from '../../gobierno/gobierno.types';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gobierno-detail-page',
  imports: [
    FormsModule,
    HubHeaderComponent,
    AppButtonComponent,
    ArchitectureFlowComponent,
    EnvironmentBoardComponent,
    GovernanceFormComponent,
    AuditLogComponent
  ],
  templateUrl: './gobierno-detail-page.component.html'
})
export class GobiernoDetailPageComponent {
  private readonly api = inject(GobiernoApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private loadedId = '';

  readonly environments = ENVIRONMENTS;
  readonly statusLabel = statusLabel;
  readonly statusTone = statusTone;
  readonly criticalityLabel = criticalityLabel;
  readonly criticalityTone = criticalityTone;
  readonly clientLabel = clientLabel;
  readonly executionLabel = executionLabel;
  readonly dependencyLabel = dependencyLabel;
  readonly roleLabel = roleLabel;
  readonly sourceLabel = sourceLabel;
  readonly formatDateTime = formatDateTime;
  readonly displayText = displayText;
  readonly isPresent = isEnvironmentPresent;

  readonly flow = signal<IntegrationFlow | null>(null);
  readonly audit = signal<AuditLog[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly selectedEnv = signal<Environment>('PRD');
  readonly allEnvironments = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly saveMessage = signal('');
  readonly retiring = signal(false);
  readonly retireError = signal('');
  readonly confirmRetire = signal(false);
  readonly listQuery = signal<Params>({});

  retireReason = '';
  retireUser = '';

  readonly versions = computed(() => {
    const history = this.flow()?.versionHistory ?? [];
    return [...history].sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
  });

  readonly visibleComponents = computed(() => {
    const flow = this.flow();
    if (!flow) {
      return [];
    }
    if (this.allEnvironments()) {
      return flow.components;
    }
    const environment = this.selectedEnv();
    return flow.components.filter(
      (component) => component.environment === '' || component.environment === environment
    );
  });

  readonly visibleDependencies = computed(() => {
    const flow = this.flow();
    if (!flow) {
      return [];
    }
    if (this.allEnvironments()) {
      return flow.dependencies;
    }
    const environment = this.selectedEnv();
    return flow.dependencies.filter(
      (dependency) => dependency.environment === '' || dependency.environment === environment
    );
  });

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = (navigation?.extras.state ?? history.state) as { listQuery?: Params } | undefined;
    if (state?.listQuery) {
      this.listQuery.set(state.listQuery);
    }

    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter((id): id is string => !!id),
        switchMap((id) => {
          this.loading.set(true);
          this.errorMessage.set('');
          return forkJoin({
            flow: this.api.getFlow(id),
            audit: this.api.getFlowAudit(id).pipe(catchError(() => of([] as AuditLog[])))
          }).pipe(
            map((result) => ({ ...result, id })),
            catchError((error: unknown) => {
              this.loading.set(false);
              this.flow.set(null);
              this.errorMessage.set(readApiError(error, 'No se pudo cargar la ficha.'));
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe(({ flow, audit, id }) => {
        const firstVisit = this.loadedId !== id;
        this.flow.set(flow);
        this.audit.set(audit);
        if (firstVisit) {
          this.selectedEnv.set(preferredEnvironment(flow));
          this.loadedId = id;
          this.confirmRetire.set(false);
        }
        this.loading.set(false);
      });
  }

  configEntries(config: Record<string, string> | null | undefined): { key: string; value: string }[] {
    return Object.entries(config ?? {}).map(([key, value]) => ({ key, value }));
  }

  save(body: UpdateGovernance): void {
    const current = this.flow();
    if (!current) {
      return;
    }

    this.saving.set(true);
    this.saveError.set('');
    this.saveMessage.set('');
    this.api
      .updateFlow(current._id, body)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (flow) => {
          this.flow.set(flow);
          this.saveMessage.set('Gobierno actualizado.');
          this.refreshAudit(flow._id);
        },
        error: (error: unknown) => {
          this.saveError.set(readApiError(error, 'No se pudo guardar la ficha.'));
        }
      });
  }

  retire(): void {
    const current = this.flow();
    if (!current) {
      return;
    }

    this.retiring.set(true);
    this.retireError.set('');
    this.api
      .retireFlow(current._id, {
        ...(this.retireUser.trim() ? { user: this.retireUser.trim() } : {}),
        ...(this.retireReason.trim() ? { reason: this.retireReason.trim() } : {})
      })
      .pipe(finalize(() => this.retiring.set(false)))
      .subscribe({
        next: (flow) => {
          this.flow.set(flow);
          this.confirmRetire.set(false);
          this.retireReason = '';
          this.refreshAudit(flow._id);
        },
        error: (error: unknown) => {
          this.retireError.set(readApiError(error, 'No se pudo retirar la ficha.'));
        }
      });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private refreshAudit(id: string): void {
    this.api.getFlowAudit(id).subscribe({
      next: (logs) => this.audit.set(logs),
      error: () => this.audit.set([])
    });
  }
}
