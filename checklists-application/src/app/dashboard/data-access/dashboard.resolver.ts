import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DashboardResolver implements Resolve<any> {
  constructor(private dashboardService: DashboardService) {}

  resolve(): Observable<any> {
    return this.dashboardService.getChecklists().pipe(
      catchError(error => {
        console.error('Error en resolver:', error);
        return of({ error: 'Error al cargar conexiones', details: error?.message });
      })
    );
  }
}
