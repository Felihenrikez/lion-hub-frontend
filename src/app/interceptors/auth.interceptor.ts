import { HttpInterceptorFn } from '@angular/common/http';

const AUTH_TOKEN_KEY = 'lion-hub-token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })
  );
};

export { AUTH_TOKEN_KEY };
