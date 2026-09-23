import { Component, computed, input, signal } from '@angular/core';
import { InterfaceJob } from '../../models/interface-job.model';

type SortKey = keyof InterfaceJob;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-interface-jobs-table',
  standalone: true,
  templateUrl: './interface-jobs-table.component.html'
})
export class InterfaceJobsTableComponent {
  rows = input.required<InterfaceJob[]>();

  sortKey = signal<SortKey | null>(null);
  sortDir = signal<SortDir>('asc');
  expanded = signal(false);

  readonly summary = computed(() => {
    const data = this.rows();
    const ok = data.filter((r) => r.estado.toLowerCase() === 'ok').length;
    const failed = data.filter((r) => r.estado.toLowerCase() === 'failed').length;
    const totalMessages = data.reduce((sum, r) => sum + r.cantidad, 0);
    return { total: data.length, ok, failed, totalMessages };
  });

  sortedRows = computed(() => {
    const key = this.sortKey();
    const data = this.rows();
    if (!key) return data;

    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * dir;
      return String(valA).localeCompare(String(valB)) * dir;
    });
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
    const normalized = status.toLowerCase();
    if (normalized === 'ok') return 'status-ok';
    if (normalized === 'failed') return 'status-failed';
    return '';
  }
}
