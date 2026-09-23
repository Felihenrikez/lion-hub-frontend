import { Component, computed, input, signal } from '@angular/core';
import { IntegrationJob } from '../../models/integration-job.model';

type SortKey = keyof IntegrationJob;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-integration-jobs-table',
  standalone: true,
  templateUrl: './integration-jobs-table.component.html'
})
export class IntegrationJobsTableComponent {
  rows = input.required<IntegrationJob[]>();

  sortKey = signal<SortKey | null>(null);
  sortDir = signal<SortDir>('asc');
  expanded = signal(false);

  readonly summary = computed(() => {
    const data = this.rows();
    const ok = data.filter((r) => r.Estado.toUpperCase().startsWith('OK')).length;
    const failed = data.filter((r) => r.Estado.toUpperCase().startsWith('FAILED')).length;
    const disabled = data.filter((r) => r.Estado.toUpperCase().startsWith('DESACTIVADA')).length;
    return { total: data.length, ok, failed, disabled };
  });

  sortedRows = computed(() => {
    const key = this.sortKey();
    const data = this.rows();
    if (!key) return data;

    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => a[key].localeCompare(b[key]) * dir);
  });

  toggle(): void {
    this.expanded.set(!this.expanded());
  }

  setExpanded(value: boolean): void {
    this.expanded.set(value);
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  getSortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  getStatusClass(status: string): string {
    const normalized = status.toUpperCase();
    if (normalized.startsWith('OK')) return 'status-ok';
    if (normalized.startsWith('FAILED')) return 'status-failed';
    if (normalized.startsWith('DESACTIVADA')) return 'status-disabled';
    return '';
  }
}
