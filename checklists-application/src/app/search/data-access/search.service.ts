import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from '../../shared/data-access/storage.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    private _http = inject(HttpClient);
    buscarRespuestas(search: { local: string, fechaInicio: string, fechaFin: string, lista?: string }): Observable<any[]> {
        // Solo incluye 'lista' si está definida y no es string vacío
        const body: any = {
            local: search.local,
            fechaInicio: search.fechaInicio,
            fechaFin: search.fechaFin
        };
        if (search.lista && search.lista !== '') {
            body.lista = search.lista;
        }

        return this._http.post<any[]>(`${environment.API_URL}/search/respuestas`, body);
    }

    buscarRespuestasDetalle(search: { local: string, fechaInicio: string, fechaFin: string, lista?: string }): Observable<{
      fechas: string[], tabla: { [entrada: string]: { [fecha: string]: { valor: string, usuario: string } } } 
    }> {
        const body: any = {
            local: search.local,
            fechaInicio: search.fechaInicio,
            fechaFin: search.fechaFin
        };
        if (search.lista && search.lista !== '') {
            body.lista = search.lista;
        }
        
        return this._http.post<{ fechas: string[], tabla: { [entrada: string]: { [fecha: string]: { valor: string, usuario: string } } } }>(`${environment.API_URL}/search/respuestas/detalle`, body);
    }
}
