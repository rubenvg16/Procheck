import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface EditUserDialogData {
  user: {
    usuario: string;
    local: string;
  };
  conexiones: any[];
}

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditUserDialogData,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      usuario: [{ value: '', disabled: true }],
      local: ['', Validators.required],
      contrasena: ['', Validators.minLength(6)]
    });
  }

  ngOnInit(): void {
    // Inicializar el formulario con los datos del usuario
    this.userForm.patchValue({
      usuario: this.data.user.usuario,
      local: this.data.user.local,
       // La contraseña está vacía por defecto al editar
    });
  }

  onCancelClick(): void {
    this.dialogRef.close(null);
  }

  onSaveClick(): void {
    if (this.userForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores de validación
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Devuelve el valor del formulario al componente padre
    const result = {
      usuario: this.data.user.usuario,
      local: this.userForm.get('local')?.value,
      contrasena: this.userForm.get('contrasena')?.value || ''
    };

    this.dialogRef.close(result);
  }
}