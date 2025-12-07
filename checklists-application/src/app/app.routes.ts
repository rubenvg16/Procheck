import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './shared/guards/auth.guard';
import { DashboardResolver } from './dashboard/data-access/dashboard.resolver';
import { inject } from '@angular/core';
import { UserService } from './user/data-access/user.service';

export const routes: Routes = [
  {
    // Ruta pública SOLO para capturar el token y redirigir
    path: 'dashboard-token',
    pathMatch: 'full',
    loadComponent: () => import('./dashboard/token-capture.component').then(m => m.TokenCaptureComponent)
  },
  {
    // Ruta protegida real
    path: 'dashboard',
    canActivate: [privateGuard()],
    runGuardsAndResolvers: 'always',
    loadComponent: () => import('./dashboard/dashboard.component'),
    resolve: { checklists: DashboardResolver }
  },
  {
    // Ruta para crear una nueva checklist
    path: 'nueva-checklist',
    canActivate: [privateGuard()],
    runGuardsAndResolvers: 'always',
    loadComponent: () => import('./checklist-form/checklist-form.component')
  },
  {
    // Ruta para crear una nueva checklist
    path: 'usuarios',
    canActivate: [privateGuard()],
    runGuardsAndResolvers: 'always',
    loadComponent: () => import('./user/user.component'),
    resolve: { 
      users: () => inject(UserService).getUsers(),
      conexiones: () => inject(UserService).getConexiones()
    }
  },
  {
    // Ruta para buscar respuestas
    path: 'search',
    canActivate: [privateGuard()],
    runGuardsAndResolvers: 'always',
    loadComponent: () => import('./search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'entradas',
    canActivate: [privateGuard()],
    loadComponent: () => import('./entradas/entradas.component').then(m => m.EntradasComponent),
  },
  {
    path: 'listas/:id',
    canActivate: [privateGuard()],
    loadComponent: () => import('./entradas/lista-detalle/lista-detalle.component').then(m => m.ListaDetailComponent),
    data: { title: 'Detalles de Lista' }
  },
  {
    // Ruta por defecto
    path: '**',
    runGuardsAndResolvers: 'always',
    redirectTo: 'dashboard',
  },
];