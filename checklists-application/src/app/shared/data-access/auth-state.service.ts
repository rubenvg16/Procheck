import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';

// Interfaz de la sesión del usuario
interface Session {
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private _storageService = inject(StorageService);

  // Cierra la sesión del usuario
  signOut() {
    this._storageService.remove('session');
  }

  // Obtiene la sesión del usuario
  getSession(): Session | null {

    let currentSession: Session | null = null;
    
    // Obtiene el token del storage
    const maybeSession = this._storageService.get<Session>('session');

    // Evalua la sesión 
    if (maybeSession !== null) {
      if (this._isValidSession(maybeSession)) {
        currentSession = maybeSession;
      } else {
        this.signOut();
      }
    }

    return currentSession;
  }

  // Comprueba si la sesión es válida
  private _isValidSession(maybeSession: unknown): boolean {
    return (
      typeof maybeSession === 'object' &&
      maybeSession !== null &&
      'access_token' in maybeSession
    );
  }
}