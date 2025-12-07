import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardService } from '../../dashboard/data-access/dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _http = inject(HttpClient);
  private dashboardService = inject(DashboardService);
  private apiUrl = `${environment.API_URL}/usuarios`;

  // Obtener todos los usuarios
  getUsers(): Observable<any[]> {
    return this._http.get<any[]>(`${this.apiUrl}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Crear un nuevo usuario
  createUser(user: { usuario: string; local: string; contrasena: string }): Observable<any> {
    return this._http.post<any>(`${this.apiUrl}`, user);
  }

  // Actualizar un usuario
  updateUser(usuario: string, user: { local: string; contrasena: string }): Observable<any> {
    return this._http.put<any>(`${this.apiUrl}/${usuario}`, user);
  }

  // Eliminar un usuario
  deleteUser(usuario: string): Observable<any> {
    return this._http.delete<any>(`${this.apiUrl}/${usuario}`);
  }

  // Obtener las conexiones/locales disponibles (reutiliza el servicio existente)
  getConexiones(): Observable<any[]> {
    return this.dashboardService.getChecklists();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}