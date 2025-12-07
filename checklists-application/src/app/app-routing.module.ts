import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from './shared/data-access/storage.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: '',
})
export class GoogleCallbackComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _storage = inject(StorageService);

  constructor() {
    const jwt = this._route.snapshot.paramMap.get('jwt');
    if (jwt) {
      this._storage.set('session', jwt);
      this._router.navigateByUrl('/dashboard');
    } else {
      this._router.navigateByUrl('/auth/log-in');
    }
  }
}