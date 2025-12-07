import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage = localStorage;

  // Obtiene un valor (el token) del almacenamiento local y lo devuelve deserializado 
  get<T>(key: string): T | null {
    const value = this._storage.getItem(key);

    if (!value) return null;

    return JSON.parse(value) as T;
  }

  // Guarda un valor(el token) en el almacenamiento local bajo la clave 'key'
  set(key: string, value: any) {
    const toStore = typeof value === 'string' ? value : JSON.stringify(value);
    this._storage.setItem(key, toStore);
  }
  // Elimina un valor (el token) del almacenamiento local con base en la clave 'key'.
  remove(key: string) {
    this._storage.removeItem(key);
  }
}