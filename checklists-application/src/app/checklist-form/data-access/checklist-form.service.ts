import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { DashboardService } from '../../dashboard/data-access/dashboard.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {

  private _http = inject(HttpClient);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  saveChecklist(nombresLocales: string[], nombreLista: string, entradas: { tipo: string; nombre: string; }[]): Observable<any> {
    // Accede al endpoint de sign-up y guarda la sesión en el storage
    return this._http
      .post(`${environment.API_URL}/checklists/checklist`, {
        nombresLocales, // Ahora enviamos un array de locales
        nombreLista,
        entradas
      }).pipe(
        tap((response) => {
          this.router.navigate(['/dashboard']);
        })
      )
  }

  getConexiones(): Observable<any[]> {
    return this.dashboardService.getChecklists();
  }

}
