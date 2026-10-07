import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppButtonComponent } from '../app-button/app-button.component';
import { GobiernoApiService } from '../../gobierno/gobierno-api.service';
import { ENVIRONMENTS, HUB_CLIENTS, readApiError } from '../../gobierno/gobierno.format';
import { Environment, ImportResult } from '../../gobierno/gobierno.types';

const MAX_ZIP_BYTES = 250 * 1024 * 1024;
const CLIENT_PATTERN = /^[a-z0-9_-]+$/;

@Component({
  selector: 'app-zip-import',
  imports: [FormsModule, AppButtonComponent],
  templateUrl: './zip-import.component.html'
})
export class ZipImportComponent {
  private readonly api = inject(GobiernoApiService);

  readonly imported = output<void>();

  readonly clients = HUB_CLIENTS;
  readonly environments = ENVIRONMENTS;
  readonly uploading = signal(false);
  readonly errorMessage = signal('');
  readonly result = signal<ImportResult | null>(null);

  clientChoice = '';
  customClientId = '';
  environment: Environment | '' = 'PRD';
  user = '';
  retireMissing = true;
  private file: File | null = null;

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
    this.errorMessage.set('');
  }

  submit(): void {
    this.errorMessage.set('');
    this.result.set(null);

    const clientId = this.resolveClientId();
    if (!clientId) {
      this.errorMessage.set('Indica el cliente en minúsculas: letras, números, guion o guion bajo.');
      return;
    }

    if (!this.environment) {
      this.errorMessage.set('Selecciona el ambiente.');
      return;
    }

    if (!this.file) {
      this.errorMessage.set('Adjunta el ZIP de artefactos.');
      return;
    }

    const fileName = this.file.name.toLowerCase();
    if (!fileName.endsWith('.zip')) {
      this.errorMessage.set('El archivo tiene que ser un .zip.');
      return;
    }

    if (this.file.size > MAX_ZIP_BYTES) {
      this.errorMessage.set('El ZIP supera el máximo de 250 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.file);
    formData.append('clientId', clientId);
    formData.append('environment', this.environment);
    if (this.user.trim()) {
      formData.append('user', this.user.trim());
    }
    formData.append('retireMissing', this.retireMissing ? 'true' : 'false');

    this.uploading.set(true);
    this.api.importZip(formData).subscribe({
      next: (result) => {
        this.uploading.set(false);
        this.result.set({
          ...result,
          packages: result.packages ?? [],
          errors: result.errors ?? []
        });
        this.imported.emit();
      },
      error: (error: unknown) => {
        this.uploading.set(false);
        this.errorMessage.set(readApiError(error, 'No se pudo importar el ZIP.'));
      }
    });
  }

  private resolveClientId(): string {
    const raw = this.clientChoice === '__other' ? this.customClientId : this.clientChoice;
    const clientId = raw.trim().toLowerCase();
    return CLIENT_PATTERN.test(clientId) ? clientId : '';
  }
}
