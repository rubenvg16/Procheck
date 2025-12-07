import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../data-access/auth.service';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap, tap } from 'rxjs';
import { StorageService } from '../../../shared/data-access/storage.service';

// Interfaz del formulario de inicio de sesión
interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ CommonModule ,RouterLink, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
})
export default class LogInComponent {
  private _authService = inject(AuthService);
  private _formBuilder = inject(FormBuilder);
  private _storage = inject(StorageService);

  // Formulario de inicio de sesión
  form = this._formBuilder.group<LoginForm>({
    email: this._formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.nonNullable.control('', Validators.required),
  });

  showPassword = false;
  eyeIcon = 'assets/img/hide.svg';
  error: string = '';

  togglePassword() {
    this.showPassword = !this.showPassword;
    // Cambia la imagen del ojo
    this.eyeIcon = this.showPassword
      ? 'assets/img/show.svg'
      : 'assets/img/hide.svg';
  }

  submit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }

    const { email, password } = this.form.getRawValue();
    // Solo llama al login, la redirección se hace en el AuthService
    this._authService.logIn(email, password).subscribe({
      error: (error) => this.error = error,
    });
  }
}