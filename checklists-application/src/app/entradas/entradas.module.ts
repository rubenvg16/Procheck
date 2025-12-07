import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaDetailComponent } from './lista-detalle/lista-detalle.component';
import { EntradasComponent } from './entradas.component';
import { HttpClientModule } from '@angular/common/http';
import { EntradasService } from './entradas.service';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [EntradasComponent, ListaDetailComponent],
  imports: [
    CommonModule,
    RouterModule,
    DragDropModule,
    HttpClientModule,
  ],
  providers: [EntradasService],
})
export class EntradasModule {}
