import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'; // <-- nuevo import

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.API_URL;
  constructor(private http: HttpClient) { }

  login(usuario: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/login-locales`, { usuario, local: '', password });
  }

  getUserLocales(usuario: string) {
    return this.http.post<string[]>(`${this.apiUrl}/auth/user-locales`, { usuario });
  }  // Método para obtener los locales asociados a un usuario. Hace un POST al endpoint /auth/user-locales enviando el usuario.

  getListasByLocales(locales: string[]) {
    return this.http.post<any[]>(`${this.apiUrl}/listas/by-locales`, { locales });
  }  // Método para obtener las listas de varios locales. Hace un POST al endpoint /listas/by-locales enviando el array de locales.

  setCurrentUsername(username: string) {
    localStorage.setItem('username', username);
  }  // Guarda el nombre de usuario en el localStorage del navegador.

  getCurrentUsername(): string {
    return localStorage.getItem('username') || '';
  }  // Obtiene el nombre de usuario guardado en el localStorage, o devuelve una cadena vacía si no existe.

}
