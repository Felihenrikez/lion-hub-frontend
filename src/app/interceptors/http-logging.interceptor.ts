import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from '../services/logger.service';

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...(body as Record<string, unknown>) };

  if ('password' in sanitized) {
    sanitized['password'] = '***';
  }

  if ('token' in sanitized) {
    sanitized['token'] = '***';
  }

  return sanitized;
}

function sanitizeHeaders(headers: Record<string, string | string[]>): Record<string, string | string[]> {
  const sanitized = { ...headers };

  if (sanitized['Authorization']) {
    sanitized['Authorization'] = 'Bearer ***';
  }

  return sanitized;
}

function headersToObject(headers: { keys(): string[]; get(name: string): string | null }): Record<string, string> {
  return headers.keys().reduce<Record<string, string>>((acc, key) => {
    const value = headers.get(key);
    if (value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export const httpLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.enableHttpLogging) {
    return next(req);
  }

  const logger = inject(LoggerService);
  const startedAt = performance.now();
  const requestId = crypto.randomUUID().slice(0, 8);

  logger.info('HTTP Request', {
    requestId,
    method: req.method,
    url: req.url,
    headers: sanitizeHeaders(headersToObject(req.headers)),
    body: sanitizeBody(req.body)
  });

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (!(event instanceof HttpResponse)) {
          return;
        }

        const isCachedResponse = event.status === 304;

        logger.info('HTTP Response', {
          requestId,
          method: req.method,
          url: req.url,
          status: event.status,
          statusText: event.statusText,
          durationMs: Math.round(performance.now() - startedAt),
          cached: isCachedResponse,
          body: isCachedResponse
            ? '(304 — sin body en red; Angular usa cache local por ETag)'
            : event.body
        });
      },
      error: (error: unknown) => {
        if (!(error instanceof HttpErrorResponse)) {
          logger.error('HTTP Error', {
            requestId,
            method: req.method,
            url: req.url,
            durationMs: Math.round(performance.now() - startedAt),
            message: String(error)
          });
          return;
        }

        logger.error('HTTP Error', {
          requestId,
          method: req.method,
          url: req.url,
          status: error.status,
          statusText: error.statusText,
          durationMs: Math.round(performance.now() - startedAt),
          body: error.error,
          message: error.message
        });
      }
    })
  );
};
