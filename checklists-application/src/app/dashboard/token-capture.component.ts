import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  template: ''
})
export class TokenCaptureComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      localStorage.setItem('session', JSON.stringify({ access_token: token })); // <-- Usa 'access_token'
    }
    this.router.navigate(['/dashboard']);
  }
}
