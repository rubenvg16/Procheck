import { Routes } from '@angular/router';

export default [
  {
    // Ruta para el log-in
    path: 'log-in',
    runGuardsAndResolvers: 'always',
    loadComponent: () => import('../log-in/log-in.component'),
  },
  {
    // Ruta para el sign-up
    path: 'sign-up',
    runGuardsAndResolvers: 'always',
    loadComponent: () => import('../sign-up/sign-up.component'),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('../forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('../reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'verify',
    loadComponent: () => import('../verify/verify.component').then(m => m.VerifyComponent),
  },
  {
    // Ruta por defecto
    path: '**',
    runGuardsAndResolvers: 'always',
    redirectTo: 'log-in',
  },
] as Routes;