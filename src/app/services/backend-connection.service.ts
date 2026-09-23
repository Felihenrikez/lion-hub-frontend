import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiConfigService } from './api-config.service';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class BackendConnectionService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  private readonly logger = inject(LoggerService);

  private connectionNotified = false;

  checkConnection(): void {
    if (this.connectionNotified || environment.production) {
      return;
    }

    const startedAt = performance.now();
    const healthUrl = this.apiConfig.url('/health');
    const fallbackUrl = this.apiConfig.url('/clients');

    this.http.get(healthUrl, { observe: 'response' }).subscribe({
      next: (response) => {
        this.notifySuccess(healthUrl, response.status, Math.round(performance.now() - startedAt));
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.checkWithFallback(fallbackUrl, startedAt);
          return;
        }

        if (error instanceof HttpErrorResponse && error.status > 0) {
          this.notifySuccess(healthUrl, error.status, Math.round(performance.now() - startedAt));
          return;
        }

        this.notifyFailure(healthUrl, error, Math.round(performance.now() - startedAt));
      }
    });
  }

  private checkWithFallback(url: string, startedAt: number): void {
    this.http
      .get(url, { observe: 'response' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status > 0) {
            this.notifySuccess(url, error.status, Math.round(performance.now() - startedAt));
            return EMPTY;
          }

          this.notifyFailure(url, error, Math.round(performance.now() - startedAt));
          return EMPTY;
        })
      )
      .subscribe((response) => {
        if (response) {
          this.notifySuccess(url, response.status, Math.round(performance.now() - startedAt));
        }
      });
  }

  private notifySuccess(url: string, status: number, durationMs: number): void {
    if (this.connectionNotified) {
      return;
    }

    this.connectionNotified = true;
    this.logger.info('Backend conectado exitosamente', {
      url,
      status,
      durationMs,
      apiBase: environment.apiUrl
    });
  }

  private notifyFailure(url: string, error: unknown, durationMs: number): void {
    if (this.connectionNotified) {
      return;
    }

    this.connectionNotified = true;
    this.logger.error('No se pudo conectar con el backend', {
      url,
      durationMs,
      apiBase: environment.apiUrl,
      message: error instanceof HttpErrorResponse ? error.message : String(error)
    });
  }
}
