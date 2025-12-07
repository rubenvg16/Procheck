import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../shared/data-access/storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _http = inject(HttpClient);
  private _storage = inject(StorageService);
  private _router = inject(Router);

  // Cambia esta URL por la de la otra aplicación
  private OTHER_APP_URL = 'http://localhost:4300/dashboard-token';

  signUp(email: string, name:string, password: string): Observable<any> {
    return this._http
      .post(`${environment.API_URL}/auth/sign-up`, {
        email,
        name,
        password
      })
      .pipe(
        tap((response: any) => {
          // Si el backend devuelve el token tras sign-up, redirige
          if (response?.access_token) {
            window.location.href = `${this.OTHER_APP_URL}?token=${response.access_token}`;
          }
          // Si no, puedes mostrar mensaje de verificación como antes
        })
      );
  }

  logIn(email: string, password: string): Observable<any> {
    return this._http
      .post(`${environment.API_URL}/auth/log-in`, {
        email,
        password,
      })
      .pipe(
        tap((response: any) => {
          if (response?.access_token) {
            window.location.href = `${this.OTHER_APP_URL}?token=${response.access_token}`;
          }
        })
      );
  }

  getProfile(): Observable<any> {
    // Obtiene el perfil del usuario autenticado
    return this._http.get(`${environment.API_URL}/auth/profile`);
  }

  forgotPassword(email: string) {
    return this._http.post(`${environment.API_URL}/auth/forgot-password`, { email });
  }
  
  resetPassword(np: string, password: string) {
    return this._http.post(`${environment.API_URL}/auth/reset-password`, { np, password });
  }
}