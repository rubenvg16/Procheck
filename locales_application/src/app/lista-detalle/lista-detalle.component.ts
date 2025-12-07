import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-lista-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './lista-detalle.component.html',
  styleUrls: ['./lista-detalle.component.css']
})
export class ListaDetalleComponent implements OnInit {
  idLista!: number; // ID de la lista actual (obtenida de la URL)
  lista: any; // Objeto con la información de la lista
  local: string = ''; // Nombre del local de la lista
  username: string = ''; // Nombre de usuario autenticado
  entradas: any[] = []; // Entradas (campos) de la lista
  form!: FormGroup; // Formulario reactivo para las respuestas
  loading = true; // Indica si está cargando la información
  message = ''; // <--- Add this for success alert
  error = ''; // Mensaje de error
  isMobile = false; // Indica si la vista es móvil

  constructor(
    private route: ActivatedRoute, // Para obtener parámetros de la ruta
    private router: Router, // Para navegar entre rutas
    private fb: FormBuilder, // Para construir el formulario reactivo
    private http: HttpClient, // Para hacer peticiones HTTP
    private loginService: LoginService // Para obtener información del usuario autenticado
  ) { }

  ngOnInit() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    this.idLista = +this.route.snapshot.paramMap.get('id')!; // Obtiene el id de la lista desde la URL y lo convierte a número.
    const nav = this.router.getCurrentNavigation(); // Obtiene la navegación actual (si existe).
    const state = nav?.extras.state as any; // Obtiene el estado pasado por la navegación (si existe).
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());

    if (state?.lista && state?.local) {
      // Si el estado tiene la lista y el local (navegacion normal):
      this.lista = state.lista;
      this.local = state.local;
      this.username = state.username || this.loginService.getCurrentUsername();
      this.loadEntradas();
    } else {
      // Si no hay estado (por ejemplo, recarga de pagina), pide la info al backend:
      this.http.get<any>(`http://localhost:3000/listas/${this.idLista}`).subscribe({
        next: (lista) => {
          this.lista = lista;
          this.local = lista.local;
          this.username = this.loginService.getCurrentUsername();
          this.loadEntradas();
        },
        error: () => {
          this.error = 'No se pudo cargar la información de la lista.';
          this.loading = false;
        }
      });
    }
  }

  loadEntradas() {
    // Carga las entradas (campos) de la lista desde el backend.
    this.http.get<any[]>(`http://localhost:3000/entradas/by-lista/${this.idLista}`).subscribe({
      next: (entradas) => {
        this.entradas = entradas;
        this.buildForm();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las entradas.';
        this.loading = false;
      }
    });
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 600;
  }

  buildForm() {
    // Construye el formulario reactivo según las entradas de la lista.
    const group: any = {};
    this.entradas.forEach(e => {
      if (e.tipo === 'casilla') {
        group[e.orden] = [false];
      } else {
        group[e.orden] = [''];
      }
    });
    this.form = this.fb.group(group);
  }

  goBack() {
    // Navega de regreso a la lista de listas.
    this.router.navigate(['/listas']);
  }

  onSubmit() {
    // Envia las respuestas al backend.
    if (!this.form.valid) return;
    const respuestas = this.entradas
      .filter(e => e.tipo !== 'subtitulo') // skip subtitulo
      .map(e => ({
        orden: e.orden,
        tipo: e.tipo,
        valor: e.tipo === 'casilla'
          ? (this.form.value[e.orden] ? 'true' : 'false')
          : this.form.value[e.orden]
      }))
      // .filter(r => // solo enviar lo rellenado, para no enviar campos vacíos
      //   (r.tipo === 'casilla' && r.valor === 'true') ||
      //   (r.tipo !== 'casilla' && r.valor && r.valor.trim() !== '')
      // );

    if (respuestas.length === 0) {
      this.error = 'Debes completar al menos un campo para enviar.';
      return;
    }

    const payload = {
      idLista: this.idLista,
      localLista: this.local,
      user: this.username,
      respuestas
    };

    this.http.post('http://localhost:3000/entradas/enviar', payload).subscribe({
      next: () => {
        this.message = 'Enviado correctamente';
        setTimeout(() => this.goBack(), 1500);
      },
      error: () => {
        this.error = 'Error al enviar la checklist.';
      }
    });
  }
}
