import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntradasService } from '../entradas.service';
import { Entrada } from '../entrada.model';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { DarkmodeToggleComponent } from '../../shared/darkmode-toggle/darkmode-toggle.component';

@Component({
  selector: 'app-lista-detalle',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    MatIconModule, 
    DragDropModule, 
    MatSlideToggleModule, 
    ReactiveFormsModule, 
    MatProgressSpinnerModule, 
    NavbarComponent,
    DarkmodeToggleComponent
  ],
  templateUrl: './lista-detalle.component.html',
  styleUrls: ['./lista-detalle.component.css'],
})
export class ListaDetailComponent implements OnInit {
  entradas: Entrada[] = [];
  idLista!: number;
  lista: { nombre: string; local: string; alta: boolean } = { nombre: '', local: '', alta: false };
  listaNombre = '';
  listaLocal = '';
  locales: string[] = [];
  newEntrada: { nombre: string; tipo: string } = { nombre: '', tipo: 'casilla' };
  showEditForm = false;
  loadingEntradas = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  showProgressBar = false;
  private messageTimeout: any;
  showAddEntryError = false;
  addEntryErrorMsg = 'Por favor, complete ambos campos para añadir una entrada.';

  constructor(
    private route: ActivatedRoute,
    private entradaService: EntradasService,
    private http: HttpClient,
    private location: Location,
  ) { }

  ngOnInit() {
    this.loadingEntradas = true;
    this.idLista = +this.route.snapshot.paramMap.get('id')!;//se obtiene id de la ruta y se convierte en numero

    //obtener entradas de la lista
    this.entradaService.getEntradasByLista(this.idLista).subscribe({
      next: (data) => {
        this.entradas = data;
        this.loadingEntradas = false;
        this.message = '';
        this.messageType = '';
      },
      error: () => {
        this.loadingEntradas = false;
        this.message = 'Error al cargar entradas de la lista';
        this.messageType = 'error';
      }
    });

    //obbtener detalles de lista
    this.entradaService.getListaDetails(this.idLista).subscribe((data) => {
      this.lista = data;
      this.listaNombre = data.nombre;
      this.listaLocal = data.local;
    });

    //localStorage.setItem('userEmail', 'test10@comercialbartolome.com');
    //obtener locales
    this.fetchLocales(); //se obtienen locales disponiles basados en usuario autenticado

    // Ocultar mensaje de error al rellenar correctamente los campos de nueva entrada
    // (Esto es para template-driven forms, así que usamos un setInterval para observar cambios)
    setInterval(() => {
      if (
        this.showAddEntryError &&
        this.newEntrada.nombre.trim() !== '' &&
        this.newEntrada.tipo.trim() !== ''
      ) {
        this.showAddEntryError = false;
      }
      // Ocultar mensaje de error de nombre de lista vacío
      if (
        this.messageType === 'error' &&
        this.message === 'El nombre de la lista no puede estar vacío.' &&
        this.lista.nombre.trim() !== ''
      ) {
        this.message = '';
        this.messageType = '';
      }
    }, 200);
  }

  fetchLocales() {
    const token = localStorage.getItem('session');

    if (!token) {
      alert('User is not logged in.');
      return;
    }

    try {
      // Decodificamos token para obtener correo del usuario
      const decodedToken: any = jwtDecode(token);

      const userEmail = decodedToken.nombre;
      //console.log('User Email:', userEmail);
      if (!userEmail) {
        alert('Email not found in token.');
        return;
      }

      // usando el correo se obtienen los locales
      this.entradaService.getLocales(userEmail).subscribe({
        next: (locales) => {
          //console.log('Fetched Locales:', locales);
          this.locales = locales;
        },
        error: () => {
          alert('Error al obtener locales');
        },
      });
    } catch (error) {
      console.error('Error decoding token:', error);
      alert('Invalid token.');
    }

  }

  deleteEntrada(entrada: Entrada) {//eliminar entrada
    this.entradas = this.entradas.filter((e) => e !== entrada);
  }

  toggleEditForm() {//mostrar o esconder formu de editar
    this.showEditForm = !this.showEditForm;
  }

  addEntrada() {//agregar nueva entrada
    if (!this.newEntrada.nombre.trim() || !this.newEntrada.tipo.trim()) {
      this.showAddEntryError = true;
      this.addEntryErrorMsg = 'Por favor, complete ambos campos para añadir una entrada.';
      return;
    }
    this.showAddEntryError = false;
    if (this.newEntrada.nombre.trim()) {
      const newEntrada = {
        nombre: this.newEntrada.nombre,
        tipo: this.newEntrada.tipo,
        orden: this.entradas.length + 1
      };
      this.entradaService.addEntrada(this.idLista, newEntrada).subscribe({
        next: (createdEntrada) => {
          this.entradas.push(createdEntrada);
          this.newEntrada = { nombre: '', tipo: 'casilla' };//se resetean/limpian los campos de formu para agregar entrada
          this.showSuccessMessage('Entrada añadida correctamente');
        },
        error: () => {
          this.addEntryErrorMsg = 'Error al añadir entrada';
          this.showAddEntryError = true;
        },
      });
    }
  }

  closeMessage() {
    this.message = '';
    this.messageType = '';
    this.showProgressBar = false;
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
  }

  // Añade este método para mostrar el mensaje de éxito con progress bar
  private showSuccessMessage(message: string): void {
    this.message = message;
    this.messageType = 'success';
    this.showProgressBar = false;
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    setTimeout(() => {
      this.showProgressBar = true;
    }, 10); // Pequeño retraso para reiniciar la animación
    this.messageTimeout = setTimeout(() => this.closeMessage(), 3000);
  }

  async saveLista() {
    if (!this.lista.nombre.trim()) {
      this.message = 'El nombre de la lista no puede estar vacío.';
      this.messageType = 'error';
      this.showProgressBar = false;
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      return;
    }
    if (!this.lista.local || !this.locales.includes(this.lista.local)) {
      this.message = 'Debe seleccionar un local válido.';
      this.messageType = 'error';
      this.showProgressBar = false;
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      return;
    }

    const payload = {
      nombre: this.lista.nombre,
      local: this.lista.local,
      alta: this.lista.alta,
      entradas: this.entradas.map((entrada, idx) => ({
        nombre: entrada.nombre,
        tipo: entrada.tipo,
        orden: idx + 1
      }))
    };
    this.entradaService.updateListaFull(this.idLista, payload).subscribe({
      next: () => {
        // Cambia aquí para usar el progress bar animado
        this.showEditForm = false;
        this.listaNombre = this.lista.nombre;
        this.listaLocal = this.lista.local;
        this.showSuccessMessage('Lista actualizada correctamente!');
      },
      error: () => {
        this.message = 'Error al actualizar lista!!!';
        this.messageType = 'error';
        this.showProgressBar = false;
        if (this.messageTimeout) clearTimeout(this.messageTimeout);
      }
    });
  }

  cancelChanges() {
    //resetea el array de las entradas a su orden original desde el backend
    this.entradaService.getEntradasByLista(this.idLista).subscribe((data) => {
      this.entradas = data;
    });

    //console.log('Cambios descartados, orden reseteado al original:', this.entradas);

    //esconder formu de editar
    this.showEditForm = false;
  }

  drop(event: CdkDragDrop<any[]>) {
    // cambiar posiciones en el array(entradas) cuando se arrastla y suelta
    moveItemInArray(this.entradas, event.previousIndex, event.currentIndex);

    // actualizar el orden visualmente
    this.entradas.forEach((entrada, index) => {
      entrada.orden = index + 1; // actualizar el orden de la entrada
    });

    //console.log('orden visual actualzado:', this.entradas);
  }

  goBack(): void {
    this.location.back();
  }

}
