import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../data-access/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  private _authService = inject(AuthService);
  private _formBuilder = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  form = this._formBuilder.group({
    password: ['', [Validators.required, this.passwordValidator()]],
    repeatPassword: ['', Validators.required],
  });

  message = '';
  error = '';
  passwordFocused = false;
  showPassword = false;
  showRepeatPassword = false;

  get np() {
    return this._route.snapshot.queryParamMap.get('np') || '';
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const meetsMinLength = value.length >= 8;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && meetsMinLength;
      return !passwordValid ? { invalidPassword: true } : null;
    };
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.form.get('password')?.value || '');
  }
  get hasLowercase(): boolean {
    return /[a-z]/.test(this.form.get('password')?.value || '');
  }
  get hasNumber(): boolean {
    return /[0-9]/.test(this.form.get('password')?.value || '');
  }
  get hasMinLength(): boolean {
    return (this.form.get('password')?.value || '').length >= 8;
  }

  get passwordsMatch(): boolean {
    const password = this.form.get('password')?.value;
    const repeatPassword = this.form.get('repeatPassword')?.value;
    if (!password || !repeatPassword) return false;
    return password === repeatPassword;
  }

  get passwordType(): string {
    return this.showPassword ? 'text' : 'password';
  }
  get repeatPasswordType(): string {
    return this.showRepeatPassword ? 'text' : 'password';
  }
  get passwordEyeIcon(): string {
    return this.showPassword ? 'assets/img/hide.svg' : 'assets/img/show.svg';
  }
  get repeatPasswordEyeIcon(): string {
    return this.showRepeatPassword ? 'assets/img/hide.svg' : 'assets/img/show.svg';
  }

  submit() {
    if (this.form.invalid || this.form.value.password !== this.form.value.repeatPassword) {
      this.form.markAllAsTouched();
      this.error = 'Las contraseñas no coinciden o no cumplen los requisitos.';
      return;
    }
    this._authService.resetPassword(this.np, this.form.value.password!).subscribe({
      next: () => {
        this.message = 'Contraseña cambiada con éxito. Puedes iniciar sesión.';
        this.error = '';
        setTimeout(() => this._router.navigateByUrl('/auth/log-in'), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cambiar la contraseña.';
        this.message = '';
      },
    });
  }
}
