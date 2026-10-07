import { Component, effect, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppButtonComponent } from '../app-button/app-button.component';
import {
  CRITICALITIES,
  DEPENDENCY_KINDS,
  EXECUTION_MODES,
  FLOW_STATUSES,
  criticalityLabel,
  dependencyLabel,
  executionLabel,
  statusLabel,
  toGovernanceDraft,
  toUpdateGovernance
} from '../../gobierno/gobierno.format';
import {
  DependencyKind,
  GovernanceDraft,
  IntegrationFlow,
  UpdateGovernance
} from '../../gobierno/gobierno.types';

const USER_KEY = 'is-gob-user';

@Component({
  selector: 'app-governance-form',
  imports: [FormsModule, AppButtonComponent],
  templateUrl: './governance-form.component.html'
})
export class GovernanceFormComponent {
  readonly flow = input.required<IntegrationFlow>();
  readonly saving = input(false);
  readonly errorMessage = input('');
  readonly save = output<UpdateGovernance>();

  readonly statuses = FLOW_STATUSES;
  readonly criticalities = CRITICALITIES;
  readonly executionModes = EXECUTION_MODES;
  readonly dependencyKinds = DEPENDENCY_KINDS;
  readonly statusLabel = statusLabel;
  readonly criticalityLabel = criticalityLabel;
  readonly executionLabel = executionLabel;
  readonly dependencyLabel = dependencyLabel;
  readonly draft = signal<GovernanceDraft | null>(null);

  private seenToken = '';

  constructor() {
    effect(() => {
      const flow = this.flow();
      const token = `${flow._id}:${flow.updatedAt}`;
      if (token === this.seenToken) {
        return;
      }

      this.seenToken = token;
      const previousUser = untracked(() => this.draft()?.user ?? '');
      this.draft.set(toGovernanceDraft(flow, previousUser || rememberedUser()));
    });
  }

  addDependency(): void {
    this.draft.update((draft) => {
      if (!draft) {
        return draft;
      }

      return {
        ...draft,
        manualDependencies: [
          ...draft.manualDependencies,
          { kind: 'OTHER' as DependencyKind, name: '', reference: '' }
        ]
      };
    });
  }

  removeDependency(index: number): void {
    this.draft.update((draft) => {
      if (!draft) {
        return draft;
      }

      return {
        ...draft,
        manualDependencies: draft.manualDependencies.filter((_, itemIndex) => itemIndex !== index)
      };
    });
  }

  submit(): void {
    const draft = this.draft();
    if (!draft) {
      return;
    }

    rememberUser(draft.user);
    this.save.emit(toUpdateGovernance(draft));
  }
}

function rememberedUser(): string {
  return sessionStorage.getItem(USER_KEY) ?? '';
}

function rememberUser(user: string): void {
  const value = user.trim();
  if (value) {
    sessionStorage.setItem(USER_KEY, value);
  }
}
