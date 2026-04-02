import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.currentUser();
  const allowedRoles = route.data['roles'] as Array<string>;

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const hasRole = allowedRoles.some(
    role => role.toLowerCase() === user.role?.toLowerCase()
  );

  if (hasRole) return true;

  return router.createUrlTree(['/dashboard']);
};