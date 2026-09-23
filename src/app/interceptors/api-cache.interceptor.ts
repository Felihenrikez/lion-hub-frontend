import { HttpInterceptorFn } from '@angular/common/http';

export const apiCacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const cacheSafeReq =
    req.method === 'GET'
      ? req.clone({
          setHeaders: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
          },
          params: req.params.set('_cb', Date.now().toString())
        })
      : req.clone({
          setHeaders: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
          }
        });

  return next(cacheSafeReq);
};
