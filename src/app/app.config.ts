import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { apiCacheInterceptor } from './interceptors/api-cache.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { httpLoggingInterceptor } from './interceptors/http-logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiCacheInterceptor, authInterceptor, httpLoggingInterceptor])
    )
  ]
};
