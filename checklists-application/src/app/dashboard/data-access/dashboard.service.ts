import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Conexion } from './dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private _http: HttpClient) {}

  getChecklists(): Observable<Conexion[]> {
    // Lee el token como objeto JSON
    const session = localStorage.getItem('session');
    let token = '';
    if (session) {
      try {
        token = JSON.parse(session).access_token;
      } catch {
        token = '';
      }
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._http.get<Conexion[]>(
      `${environment.API_URL}/dashboard/checklists`,
      { headers }
    );
  }

  
  setListInactive(idLista: number, alta: number = 0) {
    return this._http.put(`${environment.API_URL}/listas/${idLista}`, { alta });
  }

  duplicateList(idLista: number, targetLocal: string) {
    return this._http.post(`${environment.API_URL}/listas/${idLista}/duplicate`, { targetLocal });
  }

  getUserConexiones(): Observable<any[]> {
    const session = localStorage.getItem('session');
    let token = '';
    if (session) {
      try {
        token = JSON.parse(session).access_token;
      } catch {
        token = '';
      }
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._http.get<any[]>(`${environment.API_URL}/dashboard/conexiones`, { headers });
  }
}
