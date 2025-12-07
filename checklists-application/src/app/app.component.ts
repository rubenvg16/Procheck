import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  
})
export class AppComponent {
   // Formulario reactivo para los campos principales
   myForm: FormGroup;
   // Array de entradas con ejemplo de datos
   entradas = [
     { tipo: 'asd', nombre: 'asd' },
     { tipo: 'asdd', nombre: 'asdd' },
     { tipo: 'asd1', nombre: 'asd1' }
   ];
 
   constructor(private fb: FormBuilder) {
     // Inicialización del formulario
     this.myForm = this.fb.group({
       nombre: [''],
       local: ['']
     });
   }
 
   // Agregar una nueva entrada
   addEntrada() {
     this.entradas.push({ tipo: '', nombre: '' });
   }
 
   // Eliminar una entrada por su índice
   removeEntrada(index: number) {
     this.entradas.splice(index, 1);
   }
 
   // Reordenar entradas al arrastrar y soltar
   drop(event: CdkDragDrop<any[]>) {
     moveItemInArray(this.entradas, event.previousIndex, event.currentIndex);
   }
}
