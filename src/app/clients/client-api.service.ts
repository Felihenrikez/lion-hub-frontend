import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { ApiConfigService } from '../services/api-config.service';

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiConfig.url('/clients'));
  }
}
