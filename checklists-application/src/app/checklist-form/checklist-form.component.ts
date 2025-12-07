import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChecklistService } from './data-access/checklist-form.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-checklist-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    DragDropModule,
    MatTableModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  templateUrl: './checklist-form.component.html',
  styleUrls: ['./checklist-form.component.css']
})
export default class ChecklistFormComponent implements OnInit {

  // Lista de conexiones a mostrar en el desplegable
  conexiones: any[] = [];

  // Array para almacenar las entradas agregadas
  entradas: { tipo: string, nombre: string }[] = [];

  // Propiedades para almacenar mensajes de error
  duplicateError: string = '';
  listNameError: string = '';
  entriesError: string = '';

  // Flag to control the error message visibility
  showAddEntryError: boolean = false;

  // Formulario para agregar entradas y datos de la checklist
  addEntryForm: FormGroup;

  // Opciones para el desplegable del campo "tipo"
  tipoOptions = [
    { value: 'casilla', viewValue: 'Casilla' },
    { value: 'texto', viewValue: 'Texto' },
    { value: 'observacion', viewValue: 'Observacion' },
    { value: 'subtitulo', viewValue: 'Subtitulo' },
  ];

  // Mapeo de cada tipo a un icono de Material
  iconMapping: { [key: string]: string } = {
    casilla: 'check_box',
    texto: 'text_fields',
    observacion: 'notes',
    subtitulo: 'subtitles'
  };

  displayedColumns: string[] = ['nombre', 'tipo'];

  isLoading: boolean = false;

  // Propiedades para el nuevo selector personalizado
  selectedConexiones: string[] = [];
  isDropdownOpen: boolean = false;
  filteredConexiones: any[] = [];

  constructor(private fb: FormBuilder,
    private location: Location,
    private checklistService: ChecklistService,
    private router: Router // <-- agrega el router aquí
  ) {
    // Se agrega un control "conexion" al formulario
    this.addEntryForm = this.fb.group({
      conexion: [[], Validators.required], // Ahora es un array vacío por defecto
      nombreLista: ['', Validators.required],
      tipo: ['', Validators.required],
      nombre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchConexiones();

    // Cerrar el dropdown cuando se hace clic fuera de él
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-multi-select') && this.isDropdownOpen) {
        this.isDropdownOpen = false;
      }
    });

    // Ocultar mensaje de error de añadir entrada cuando los campos son válidos
    this.addEntryForm.get('tipo')?.valueChanges.subscribe(() => {
      if (this.addEntryForm.get('tipo')?.valid && this.addEntryForm.get('nombre')?.valid) {
        this.showAddEntryError = false;
        this.duplicateError = '';
      }
    });
    this.addEntryForm.get('nombre')?.valueChanges.subscribe(() => {
      if (this.addEntryForm.get('tipo')?.valid && this.addEntryForm.get('nombre')?.valid) {
        this.showAddEntryError = false;
        this.duplicateError = '';
      }
    });

    // Ocultar mensaje de error de nombre de lista cuando es válido
    this.addEntryForm.get('nombreLista')?.valueChanges.subscribe(() => {
      if (this.addEntryForm.get('nombreLista')?.valid) {
        this.listNameError = '';
      }
    });
  }

  fetchConexiones(): void {
    this.isLoading = true;
    this.checklistService.getConexiones().subscribe(
      (data: any[]) => {
        this.conexiones = data;
        this.filteredConexiones = [...this.conexiones];
        this.isLoading = false;
      },
      error => {
        console.error('Error al obtener las conexiones:', error);
        this.isLoading = false;
      }
    );
  }

  // Métodos para el selector personalizado
  toggleDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleConexion(nombreConexion: string): void {
    const index = this.selectedConexiones.indexOf(nombreConexion);
    if (index === -1) {
      this.selectedConexiones.push(nombreConexion);
    } else {
      this.selectedConexiones.splice(index, 1);
    }
    
    // Actualizar el valor del formulario
    this.addEntryForm.patchValue({ conexion: this.selectedConexiones });
  }

  isSelected(nombreConexion: string): boolean {
    return this.selectedConexiones.includes(nombreConexion);
  }

  onAddEntryClick(): void {
    const tipoControl = this.addEntryForm.get('tipo');
    const nombreControl = this.addEntryForm.get('nombre');

    if (tipoControl?.invalid || nombreControl?.invalid) {
      this.showAddEntryError = true; // Mostrar mensaje de error
    } else {
      this.showAddEntryError = false; // Ocultar mensaje de error
      this.addEntrada(); // Llamar a la función para agregar la entrada
    }
  }

  addEntrada(): void {
    const tipoControl = this.addEntryForm.get('tipo');
    const nombreControl = this.addEntryForm.get('nombre');

    if (tipoControl?.valid && nombreControl?.valid) {
      const tipo = tipoControl.value;
      const nombre = nombreControl.value.trim();

      // Verificar duplicados: misma combinación de nombre y tipo (ignorando mayúsculas y espacios)
      const duplicateEntry = this.entradas.find(
        e => e.tipo === tipo && e.nombre.trim().toLowerCase() === nombre.toLowerCase()
      );

      if (duplicateEntry) {
        this.duplicateError = 'Esa entrada ya existe.';
        this.showAddEntryError = false;
        return;
      } else {
        this.duplicateError = '';
      }

      const newEntry = { tipo, nombre };
      this.entradas.push(newEntry);

      // Reiniciar los controles 'tipo' y 'nombre' sin afectar otros campos
      this.addEntryForm.patchValue({ tipo: '', nombre: '' });
      this.addEntryForm.get('tipo')?.markAsPristine();
      this.addEntryForm.get('nombre')?.markAsPristine();

      // Limpiar error de entradas en caso de que se hubieran mostrado
      this.entriesError = '';
      this.showAddEntryError = false;
      this.duplicateError = '';
    }
  }

  // Eliminar una entrada por su índice
  removeEntrada(index: number): void {
    this.entradas.splice(index, 1);
  }

  // Reordenar las entradas mediante Drag & Drop
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.entradas, event.previousIndex, event.currentIndex);
  }

  // Volver atrás en la navegación
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Guardar la checklist completa con validaciones: nombre de la lista, conexión y al menos una entrada
  // Frontend (Angular)
  onSubmit(): void {
    const nombreLista = this.addEntryForm.get('nombreLista')?.value;

    // Ahora usamos selectedConexiones en lugar de obtenerlo del formulario
    if (!this.selectedConexiones || this.selectedConexiones.length === 0) {
      this.listNameError = 'Debe elegir al menos un local.';
      return;
    }

    if (!nombreLista || nombreLista.trim() === '') {
      this.listNameError = 'Debe introducir un nombre de lista';
      return;
    } else {
      this.listNameError = '';
    }

    if (this.entradas.length === 0) {
      this.entriesError = 'Debe añadir alguna entrada';
      return;
    } else {
      this.entriesError = '';
    }

    // Enviar la información al backend
    this.checklistService.saveChecklist(this.selectedConexiones, nombreLista, this.entradas).subscribe(
      () => {
      },
      error => {
        console.error('Error al guardar la lista:', error);
      }
    );
  }
}
