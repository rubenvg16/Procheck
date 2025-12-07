import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../shared/data-access/storage.service';

@Component({
  selector: 'app-log-in-succes',
  standalone: true,
  template: '',
})
export class LogInSuccesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);

  // Cambia esta URL por la de la otra aplicación
  private OTHER_APP_URL = 'http://localhost:4300/dashboard-token';

  ngOnInit() {
    const jwt = this.route.snapshot.paramMap.get('jwt');
    if (jwt) {
      // Redirige a la otra app con el token
      window.location.href = `${this.OTHER_APP_URL}?token=${jwt}`;
    } else {
      this.router.navigateByUrl('/auth/log-in');
    }
  }
}
