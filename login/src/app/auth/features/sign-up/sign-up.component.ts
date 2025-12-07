import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export default class SignUpComponent {
  private _authService = inject(AuthService);

  private _formBuilder = inject(FormBuilder);

  private _router = inject(Router);

  showPassword = false;
  showRepeatPassword = false;
  showAlert = false;
  passwordsMatch = true;
  userExistsError = false;

  successMessage = '';
  formattedSuccessMessage = '';

  eyeIcon = 'assets/img/hide.svg';
  eyeIconSlash = 'assets/img/show.svg';
  eyeIconRepeat = 'assets/img/hide.svg';

  //validator personalizado para las contrasenas
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return { required: true };
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const meetsMinLength = value.length >= 8;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && meetsMinLength;

      return !passwordValid ? { invalidPassword: true } : null;
    };
  }

  form = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    password: ['', [Validators.required, this.passwordValidator()]],
    repeatPassword: ['', Validators.required],
  }, { validators: this.passwordsMatchValidator });


  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const repeatPassword = form.get('repeatPassword')?.value;

    if (!password || !repeatPassword) {
      return null;
    }

    return password === repeatPassword ? null : { passwordsMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.eyeIcon = this.showPassword ? 'assets/img/show.svg' : 'assets/img/hide.svg';
  }

  toggleRepeatPassword() {
    this.showRepeatPassword = !this.showRepeatPassword;
    this.eyeIconRepeat = this.showRepeatPassword ? 'assets/img/show.svg' : 'assets/img/hide.svg';
  }

  passwordFocused = false;

  onPasswordFocus() {
    this.passwordFocused = true;
  }

  onPasswordBlur() {
    setTimeout(() => {
      this.passwordFocused = false;
    }, 200);
  }

  //comprobar que pass coinciden
  checkPasswordsMatch() {
    const password = this.form.get('password')?.value;
    const repeatPassword = this.form.get('repeatPassword')?.value;

    // solo comprobar que ambos campos tienen valor
    if (password && repeatPassword) {
      this.passwordsMatch = password === repeatPassword;
      this.form.updateValueAndValidity();
    }
  }

  closeAlert() {
    this.showAlert = false;
  }

  closeUserExistsError() {
    this.userExistsError = false;
  }

  submit() { 
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });

      const password = this.form.get('password')?.value;
      const repeatPassword = this.form.get('repeatPassword')?.value;

      if (password !== repeatPassword) {
        this.showAlert = true
      }
      return;
    }

    this.userExistsError = false;

    const { email, name, password: pwd } = this.form.getRawValue();

    this._authService.signUp(email, name, pwd).subscribe({
      next: (response) => {
        // Si el backend devuelve el token, redirige (la lógica está en AuthService)
        // Si no, muestra el mensaje de verificación como antes
        if (!response?.access_token) {
          this.successMessage = `Se ha enviado un correo de verificación a ${email}`;
          const emailParts = email.split('@');
          this.formattedSuccessMessage = `Se ha enviado un correo de verificación a <strong>${emailParts[0]}@${emailParts[1]}</strong>`;
          this.form.reset();
        }
      },
      error: (error) => {
        if (error?.status === 400 && error?.error?.message === 'El usuario ya existe') {
          this.userExistsError = true;
        }
      },
    });
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

}