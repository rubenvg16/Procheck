import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../shared/data-access/storage.service';

@Component({
  standalone: true,
  template: `<div>Cargando...</div>`,
})
export class GoogleCallbackComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);

  // Cambia esta URL por la de la otra aplicación
  private OTHER_APP_URL = 'http://localhost:4300/dashboard-token';

  constructor() {
    this.route.paramMap.subscribe(params => {
      const jwt = params.get('jwt');
      if (jwt) {
        // Redirige a la otra app con el token
        window.location.href = `${this.OTHER_APP_URL}?token=${jwt}`;
      } else {
        this.router.navigateByUrl('/auth/log-in');
      }
    });
  }
}
