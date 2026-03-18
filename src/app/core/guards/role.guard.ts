import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.currentUser();
  // Obtenemos los roles permitidos definidos en la data de la ruta
  const allowedRoles = route.data['roles'] as Array<string>;

  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  // Si no tiene permiso, lo mandamos al dashboard principal o una página 403
  router.navigate(['/dashboard']);
  return false;
};