import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  readonly apiUrl = environment.apiUrl.replace(/\/$/, '');
  readonly catalogApiUrl = environment.catalogApiUrl.replace(/\/$/, '');

  url(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiUrl}${normalizedPath}`;
  }

  catalogUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.catalogApiUrl}${normalizedPath}`;
  }
}
