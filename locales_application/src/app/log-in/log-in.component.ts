import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class UserLoginComponent {
  loginForm: FormGroup;
  error = false;

  showPassword = false;
  eyeIcon = 'assets/img/hide.svg';

  togglePassword() {
    this.showPassword = !this.showPassword;
    // Cambia la imagen del ojo
    this.eyeIcon = this.showPassword
      ? 'assets/img/show.svg'
      : 'assets/img/hide.svg';
  }

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    document.body.classList.remove('dark-mode');
    this.loginForm = this.fb.group({//se crea el formulario reactivo
      username: ['', Validators.required], // se define el campo username como requerido
      password: ['', Validators.required] // se define el campo password como requerido
    });
  }

  onLogin() {
    const { username, password } = this.loginForm.value; // Extrae los valores de usuario y contraseña del formulario.

    this.loginService.login(username, password).subscribe({ // Llama al método login del servicio, que hace una petición al backend.
      next: () => {
        this.loginService.setCurrentUsername(username); // Si el login es exitoso, guarda el nombre de usuario en localStorage.

        this.loginService.getUserLocales(username).subscribe({ // Obtiene los locales asociados a ese usuario desde el backend.
          next: (locales) => {
            this.loginService.getListasByLocales(locales).subscribe({ // Obtiene las listas de esos locales desde el backend.
              next: (listas) => {
                this.router.navigate(['/listas'], { state: { listas, locales, username } }); // Navega a la ruta '/listas' y pasa las listas, locales y username como estado.
              }
            });
          }
        });
      },
      error: () => {
        this.error = true; // Si ocurre un error (login incorrecto), muestra un mensaje de error.
      }
    });
  }
}