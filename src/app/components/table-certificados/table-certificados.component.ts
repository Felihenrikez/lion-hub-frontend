import { Component, computed, input, signal } from '@angular/core';
import { Certificado } from '../../models/certificado.model';

type SortKey = keyof Certificado;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-table-certificados',
  standalone: true,
  templateUrl: './table-certificados.component.html'
})
export class TableCertificadosComponent {
  rows = input.required<Certificado[]>();

  sortKey = signal<SortKey | null>(null);
  sortDir = signal<SortDir>('asc');
  expanded = signal(false);

  readonly summary = computed(() => {
    const data = this.rows();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToExpire = data
      .map((r) => Math.ceil((new Date(r.fechaExpiracion).getTime() - today.getTime()) / 86400000))
      .sort((a, b) => a - b)[0] ?? null;
    return { total: data.length, daysToExpire };
  });

  sortedRows = computed(() => {
    const key = this.sortKey();
    const data = this.rows();
    if (!key) return data;

    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => String(a[key]).localeCompare(String(b[key])) * dir);
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
}
