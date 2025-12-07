import { Routes } from '@angular/router';
import { publicGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    // Ruta para la autenticación
    path: 'auth',
    canActivate: [publicGuard()],
    runGuardsAndResolvers: 'always',
    loadChildren: () => import('./auth/features/shell/auth.routes'),
  },
  {
    path: 'login/succes/:jwt',
    loadComponent: () =>
      import('./auth/features/log-in-succes/log-in-succes.component').then(m => m.LogInSuccesComponent)
  },
  {
    // Ruta por defecto
    path: '**',
    runGuardsAndResolvers: 'always',
    redirectTo: 'auth/log-in',
  },
];