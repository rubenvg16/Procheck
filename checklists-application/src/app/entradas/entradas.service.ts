import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entrada } from './entrada.model'; 
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class EntradasService {
  constructor(private http: HttpClient) {}

   // Obtiene todas las entradas desde el backend
  getEntradas(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/entradas`);
  }

  // Obtiene todas las entradas de una lista específica
  getEntradasByLista(idLista: number): Observable<Entrada[]> {
    return this.http.get<Entrada[]>(`${environment.API_URL}/entradas/by-lista/${idLista}`);
  }

  // Actualiza una entrada específica por su ID
  updateEntrada(id: number, entrada: Partial<Entrada>): Observable<Entrada> {
    return this.http.put<Entrada>(`${environment.API_URL}/entradas/${id}`, entrada);
  }
  
  // Obtiene los detalles de una lista específica por su ID
  getListaDetails(idLista: number): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/listas/${idLista}`);
  }

  // Actualiza una lista específica por su ID
  updateLista(idLista: number, lista: Partial<{ nombre: string; local: string; alta: boolean }>): Observable<any> {
    const payload = { ...lista, alta: lista.alta ? 1 : 0 }; // Convert alta to 0 or 1
    return this.http.put<any>(`${environment.API_URL}/listas/${idLista}`, payload);
  }

  // Elimina una entrada de una lista por el ID de la lista y el orden
  deleteEntrada(idLista: number, orden: number): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/entradas/${idLista}/${orden}`);
  }

  // Agrega una nueva entrada a una lista específica
  addEntrada(idLista: number, entrada: Partial<Entrada>): Observable<Entrada> {
    return this.http.post<Entrada>(`${environment.API_URL}/entradas/by-lista/${idLista}`, entrada);
  }

  // Obtiene los locales asociados a un email de usuario
  getLocales(email: string) {
    return this.http.get<string[]>(`${environment.API_URL}/entradas/locales/${email}`);
  }

  updateListaFull(idLista: number, payload: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/listas/${idLista}/full-update`, payload);
  }

  // Método para actualizar una lista en múltiples locales
  updateListaFullMultiple(idLista: number, payload: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/listas/${idLista}/full-update-multiple`, payload);
  }
}
