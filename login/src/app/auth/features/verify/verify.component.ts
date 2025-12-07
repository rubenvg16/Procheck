import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment'; 

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  message = '';
  error = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const np = this.route.snapshot.queryParamMap.get('np');
    if (np) {
      this.http.post<{ message: string }>(`${environment.API_URL}/auth/verify`, { np }).subscribe({
        next: (res) => this.message = res.message,
        error: (err) => this.error = err.error?.message || 'Error de validación',
      });
    } else {
      this.error = 'Enlace de verificación inválido.';
    }
  }
}
