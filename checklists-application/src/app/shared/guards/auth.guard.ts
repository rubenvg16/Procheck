import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../data-access/auth-state.service';

export const privateGuard = (): CanActivateFn => {
  return () => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    // Obtiene la sesión del usuario
    const session = authState.getSession();

    // Si existe una sesión, devuelve verdadero
    if (session) {
      return true;
    }

    // Si no existe una sesión, redirige al usuario a la página de inicio de sesión
    router.navigateByUrl('/auth/log-in');

    return false;
  };
};

export const publicGuard = (): CanActivateFn => {
  return () => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    // Obtiene la sesión del usuario
    const session = authState.getSession();

    // Si existe una sesión, redirige al usuario al dashboard
    if (session) {
      router.navigateByUrl('/dashboard');
      return false;
    }

    return true;
  };
};