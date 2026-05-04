import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  if (auth.isLoggedIn()) return router.createUrlTree(['/']);

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: '/admin' }
  });
};
