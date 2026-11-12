import { HttpInterceptorFn } from '@angular/common/http';

export const AUTH_TOKEN_KEY = 'worksphere_jwt_token';

/**
 * Functional HTTP Interceptor that attaches the JWT Bearer token to all Backend API requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('auth_token');
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(cloned);
    }
  }
  return next(req);
};
