import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntradasService } from './entradas.service';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DarkmodeToggleComponent } from '../shared/darkmode-toggle/darkmode-toggle.component';

@Component({
  selector: 'app-entradas',
  templateUrl: './entradas.component.html',
  styleUrls: ['./entradas.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule, DragDropModule, DarkmodeToggleComponent],
})
export class EntradasComponent implements OnInit {
  entradas: any[] = [];

  constructor(private entradasService: EntradasService) {}

  ngOnInit(): void {
    this.entradasService.getEntradas().subscribe((data) => {
      this.entradas = data;
    });
  }

  getIconForType(tipo: string): string {
    const iconMapping: { [key: string]: string } = {
      casilla: 'check_box',
      texto: 'text_fields',
      observacion: 'notes',
      subtitulo: 'subtitles'
    };
    return iconMapping[tipo] || 'error';
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.entradas, event.previousIndex, event.currentIndex);
  }

  removeEntrada(entrada: any) {
    this.entradas = this.entradas.filter(e => e !== entrada);
  }
}
