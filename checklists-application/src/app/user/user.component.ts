import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { UserService } from './data-access/user.service';
import { ConfirmDialogComponent } from '../shared/confirm.dialog/confirm-dialog.component';
import { EditUserDialogComponent } from '../shared/edit-user-dialog/edit-user-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-user-management',
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
    MatTableModule,
    MatDialogModule,
    MatSortModule,
    NavbarComponent
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export default class UserComponent implements OnInit {
  // Lista de usuarios
  users: any[] = [];

  // Lista de conexiones (locales) disponibles
  conexiones: any[] = [];

  // Formulario para crear usuarios
  userForm: FormGroup;

  // Usuario seleccionado para edición (se mantiene para poder abrir la ventana externa)
  selectedUser: any = null;

  // Mensajes de error
  formError: string = '';
  formSubmitted: boolean = false;

  // Columnas para la tabla
  displayedColumns: string[] = ['usuario', 'local', 'acciones'];

  isLoading: boolean = false;
  successMessage: string = '';
  showProgressBar = false; // Añadido para el control de la barra de progreso
  fadeOutMessage = false; // Añadido para el control de la animación de desvanecimiento
  private messageTimeout: any = null;

  // Mensajes generales
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  private showSuccessMessage(msg: string): void {
    this.message = msg;
    this.messageType = 'success';
    this.showProgressBar = true;
    this.fadeOutMessage = false;
    
    // Escuchar el evento de finalización de la animación
    setTimeout(() => {
      this.fadeOutMessage = true;
      
      setTimeout(() => {
        this.message = '';
        this.showProgressBar = false;
        this.fadeOutMessage = false;
      }, 300);
    }, 3000); 
  }

  private showErrorMessage(msg: string): void {
    this.message = msg;
    this.messageType = 'error';
    
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      usuario: ['', [Validators.required]],
      local: ['', Validators.required],
      contrasena: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.users = data['users'];
      this.conexiones = data['conexiones'];
      
      // Establecer el primer local como predeterminado si está disponible
      if (this.conexiones && this.conexiones.length > 0) {
        this.userForm.patchValue({
          local: this.conexiones[0].nombreConexion
        });
      }
      
      this.isLoading = false;
      this.sortData({ active: 'usuario', direction: 'asc' }); // Ordenamiento inicial
    });
  }

  private loadInitialData(): void {
    // Este método ya no es necesario, los datos vienen del resolver
    this.isLoading = false;
  }

  // Obtener todos los usuarios
  fetchUsers(callback?: () => void): void {
    this.userService.getUsers().subscribe(
      (data: any[]) => {
        this.users = data;
        if (callback) callback();
      },
      error => {
        console.error('Error al obtener los usuarios:', error);
        if (callback) callback();
      }
    );
  }

  // Obtener conexiones/locales disponibles
  fetchConexiones(callback?: () => void): void {
    this.userService.getConexiones().subscribe(
      (data: any[]) => {
        this.conexiones = data;
        if (callback) callback();
      },
      error => {
        console.error('Error al obtener las conexiones:', error);
        if (callback) callback();
      }
    );
  }

  // Volver atrás en la navegación
  goBack(): void {
    if (!this.isLoading) {
      this.location.back();
    }
  }

  // Enviar el formulario para crear un usuario
  onSubmit(): void {
    this.formSubmitted = true;
    if (this.userForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores de validación
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });

      return;
    }
  
    this.formError = '';
    this.isLoading = true;
    const formValue = this.userForm.value;
  
    // Lógica para crear un nuevo usuario
    this.userService.createUser({
      usuario: formValue.usuario,
      local: formValue.local,
      contrasena: formValue.contrasena
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccessMessage('Usuario creado correctamente');
        this.fetchUsers();
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.showErrorMessage(err.message || 'Error al crear el usuario');
      }
    });
  }

  // Resetear el formulario
  resetForm(): void {
    this.userForm.reset();
    
    // Reasignar las validaciones después de resetear
    this.userForm.get('usuario')?.setValidators([Validators.required]);
    this.userForm.get('local')?.setValidators([Validators.required]);
    this.userForm.get('contrasena')?.setValidators([Validators.required]);

    // Actualizar el estado de las validaciones
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.updateValueAndValidity();
      control?.markAsPristine();
      control?.markAsUntouched();
    });

    // Resetear variables adicionales
    this.selectedUser = null;
    this.formError = '';
    this.formSubmitted = false;
  }

  // Limpiar errores de un campo específico del formulario
  clearError(fieldName: string): void {
    const control = this.userForm.get(fieldName);
    if (control) {
      control.setErrors(null);
      control.markAsUntouched();
      control.markAsPristine();
      // Si el campo tiene valor pero estaba marcado como inválido, actualiza su validez
      if (control.value) {
        control.updateValueAndValidity();
      }
    }
  }

  // Limpiar el mensaje de error general del formulario
  clearFormError(): void {
    this.formError = '';
  }

  // Ordenar los datos de la tabla
  sortData(sort: { active: string; direction: string }) {
    const data = this.users.slice();
    if (!sort.active || sort.direction === '') {
      this.users = data;
      return;
    }

    this.users = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'usuario':
          return compare(a.usuario, b.usuario, isAsc);
        case 'local':
          return compare(a.local, b.local, isAsc);
        default:
          return 0;
      }
    });
  }

  // Editar usuario mediante ventana externa
  editUser(user: any): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      data: {
        user: user,
        conexiones: this.conexiones
      },
      disableClose: true // Impide cerrar el diálogo haciendo clic fuera
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        
        // Prepara los datos para actualizar
        const updateData: { local: string; contrasena: string } = {
          local: result.local,
          contrasena: ''
        };
        
        // Solo incluye la contraseña si se ha ingresado una nueva
        if (result.contrasena && result.contrasena.trim() !== '') {
          updateData.contrasena = result.contrasena;
        }
  
        // Llama al servicio para actualizar el usuario
        this.userService.updateUser(result.usuario, updateData).subscribe({
          next: () => {
            this.isLoading = false;
            this.showSuccessMessage('Usuario actualizado correctamente');
            this.fetchUsers(); // Actualiza la lista de usuarios
          },
          error: (err) => {
            this.isLoading = false;
            this.showErrorMessage(err.message || 'Error al actualizar el usuario');
          }
        });
      }
    });
  }

  // Eliminar un usuario con confirmación
  deleteUser(user: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Eliminar Usuario',
        message: `¿Está seguro que desea eliminar al usuario "${user.usuario}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.usuario).subscribe(
          () => {
            this.fetchUsers();
          },
          error => {
            console.error('Error al eliminar el usuario:', error);
          }
        );
      }
    });
  }
}

// Función auxiliar para comparar valores en el ordenamiento
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
