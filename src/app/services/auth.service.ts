import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AUTH_TOKEN_KEY } from '../interceptors/auth.interceptor';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { ApiConfigService } from './api-config.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  readonly isLoggedIn = signal(this.readInitialState());

  login(username: string, password: string): Observable<boolean> {
    const body: LoginRequest = {
      username: username.trim(),
      password: password.trim()
    };

    return this.http.post<LoginResponse>(this.apiConfig.url('/auth/login'), body).pipe(
      tap((response) => {
        const token = response.token ?? response.accessToken;

        if (!token) {
          throw new Error('Login response without token');
        }

        localStorage.setItem(AUTH_TOKEN_KEY, token);
        this.isLoggedIn.set(true);
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.isLoggedIn.set(false);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  private readInitialState(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }
}
