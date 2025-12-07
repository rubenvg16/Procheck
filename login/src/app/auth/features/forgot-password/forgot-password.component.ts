import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  private _authService = inject(AuthService);
  private _formBuilder = inject(FormBuilder);

  form = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  message = '';
  error = '';

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this._authService.forgotPassword(this.form.value.email!).subscribe({
      next: () => {
        this.message = 'Si el correo existe, se ha enviado un enlace de recuperación.';
        this.error = '';
      },
      error: (err) => {
        //mostrar error desde backend
        this.error = err.error?.message || 'Error al enviar el correo.';
        this.message = '';
      },
    });
  }
}
