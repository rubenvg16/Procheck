import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChecklistService } from '../checklist-form/data-access/checklist-form.service';
import { DashboardService } from '../dashboard/data-access/dashboard.service';
import { SearchService } from './data-access/search.service';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, Sort } from '@angular/material/sort';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatTooltipModule,
    MatSortModule,
    NavbarComponent
  ],
  providers: [DatePipe],
  standalone: true
})
export class SearchComponent implements OnInit {
  search = {
    local: '', // Se actualizará en ngOnInit si hay locales
    fechaInicio: new Date().toISOString().substring(0, 10),
    fechaFin: new Date().toISOString().substring(0, 10),
    lista: '' // Se actualizará en filtrarListasPorLocal si hay listas
  };
  respuestas: any[] = [];

  locales: string[] = [];
  listas: { nombre: string, id: any }[] = [];
  todasLasListas: { nombre: string, id: any, local: string }[] = [];

  fechas: string[] = [];
  entradas: string[] = [];
  originalEntradas: string[] = [];
  tablaValores: { [entrada: string]: { [fecha: string]: { valor: any, usuario: string } } } = {};
  searchExecuted = false;
  sortDirection: 'original' | 'asc' | 'desc' = 'original';
  isLoading = false; // Nueva propiedad para animación de carga

  // Forzar máximo columnas por página
  private readonly MAX_COLUMNS = 5;
  maxColumns = this.MAX_COLUMNS;
  fechaPage = 1;
  usuario: any;
  get totalFechaPages(): number {
    // usar la constante para calcular páginas
    return Math.ceil(this.fechas.length / this.MAX_COLUMNS) || 1;
  }
  get pagedFechas(): string[] {
    const start = (this.fechaPage - 1) * this.MAX_COLUMNS;
    return this.fechas.slice(start, start + this.MAX_COLUMNS);
  }

  // Manejo responsivo de columnas
  isMobile = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  constructor(
    private checklistService: ChecklistService,
    private dashboardService: DashboardService,
    private searchService: SearchService,
    private location: Location // añadido para retroceso
  ) { }

  ngOnInit(): void {
    this.checkScreenSize();

    this.checklistService.getConexiones().subscribe((data: any[]) => {
      this.locales = data.map(c => c.nombreConexion);
      if (this.locales.length > 0) {
        this.search.local = this.locales[0];
      }
      this.filtrarListasPorLocal();
    });

    this.dashboardService.getChecklists().subscribe((data: any[]) => {
      this.todasLasListas = [];
      data.forEach(conexion => {
        if (conexion.checklists && Array.isArray(conexion.checklists)) {
          conexion.checklists.forEach((cl: any) => {
            this.todasLasListas.push({ nombre: cl.nombre, id: cl.id, local: conexion.nombreConexion });
          });
        }
      });
      this.filtrarListasPorLocal();
    });
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    this.isMobile = width < 768;

    // Forzar siempre máximo 5 columnas por página
    this.maxColumns = this.MAX_COLUMNS;

    // Reiniciar a la primera página cuando cambia el tamaño de la pantalla
    this.fechaPage = 1;
  }

  filtrarListasPorLocal() {
    if (this.search.local) {
      this.listas = this.todasLasListas.filter(l => l.local === this.search.local);
      if (this.listas.length > 0) {
        this.search.lista = this.listas[0].nombre;
      } else {
        this.search.lista = '';
      }
    } else {
      this.listas = [];
      this.search.lista = '';
    }
  }

  onLocalChange() {
    this.filtrarListasPorLocal();
  }

  onSearch() {
    this.fechaPage = 1;
    this.isLoading = true;
    this.searchExecuted = false;
    const searchPayload = {
      local: this.search.local,
      fechaInicio: this.search.fechaInicio,
      fechaFin: this.search.fechaFin,
      lista: this.search.lista && this.search.lista !== '' ? this.search.lista : undefined
    };

    this.searchService.buscarRespuestasDetalle(searchPayload)
      .subscribe(data => {
        this.fechas = data.fechas;
        this.tablaValores = data.tabla;
        this.entradas = Object.keys(data.tabla);
        this.originalEntradas = [...this.entradas];
        this.isLoading = false;
        this.searchExecuted = true;
      }, err => {
        this.fechas = [];
        this.tablaValores = {};
        this.entradas = [];
        this.originalEntradas = [];
        this.isLoading = false;
        this.searchExecuted = true;
      });
  }

  procesarTablaRespuestas() {
    // Suponiendo que cada respuesta tiene un array 'entradas' con { nombre, valor }
    // y un campo 'fecha'
    const fechasSet = new Set<string>();
    const entradasSet = new Set<string>();
    const tabla: { [entrada: string]: { [fecha: string]: any } } = {};

    for (const r of this.respuestas) {
      const fecha = (typeof r.fecha === 'string') ? r.fecha.substring(0, 10) : new Date(r.fecha).toISOString().substring(0, 10);
      fechasSet.add(fecha);
      if (Array.isArray(r.entradas)) {
        for (const e of r.entradas) {
          entradasSet.add(e.nombre);
          if (!tabla[e.nombre]) tabla[e.nombre] = {};
          tabla[e.nombre][fecha] = e.valor;
        }
      }
    }
    this.fechas = Array.from(fechasSet).sort();
    this.entradas = Array.from(entradasSet); // Removido el sort inicial
    this.tablaValores = tabla;
  }

  sortData(sort: Sort) {
    const data = this.entradas.slice();
    if (!sort.active || sort.direction === '') {
      this.entradas = this.originalEntradas.slice();
      return;
    }

    this.entradas = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    });
    this.fechaPage = 1;   // Reiniciar a la primera página de fechas al ordenar
  }

  goToFechaPage(page: number) {
    if (page >= 1 && page <= this.totalFechaPages) {
      this.fechaPage = page;
    }
  }

  nextFechaPage() {
    if (this.fechaPage < this.totalFechaPages) {
      this.fechaPage++;
    }
  }

  prevFechaPage() {
    if (this.fechaPage > 1) {
      this.fechaPage--;
    }
  }

  isCasilla(entrada: string): boolean {
    // Verifica si el nombre de la entrada incluye 'casilla'
    return entrada.toLowerCase().includes('casilla');
  }

  isCheckboxEntrada(entrada: string): boolean {
    // Considera como checkbox si el nombre contiene 'casilla', 'checkbox' o 'subtitulo'
    const name = entrada.toLowerCase();
    return name.includes('casilla') || name.includes('checkbox') || name.includes('subtitulo');
  }

  isBoolean(value: any): boolean {
    // Si value es undefined o null, retorna false
    if (value === undefined || value === null) return false;
    // Adaptar para estructura { valor, usuario }
    if (typeof value === 'object' && value !== null && 'valor' in value) {
      value = value.valor;
    }
    return value === true || value === false || value === 'true' || value === 'false';
  }

  isObservacion(entrada: string): boolean {
    return entrada.toLowerCase().includes('observacion') || 
           entrada.toLowerCase().includes('observaciones');
  }

  isTexto(entrada: string, valor: any): boolean {
    if (valor && typeof valor === 'object' && 'valor' in valor) {
      valor = valor.valor;
    }
    if (this.isBoolean(valor) || (!isNaN(valor) && valor !== '' && valor !== null)) {
      return false;
    }
    return typeof valor === 'string';
  }

  isNumber(value: any): boolean {
    if (value && typeof value === 'object' && 'valor' in value) {
      value = value.valor;
    }
    return !isNaN(value) && typeof value !== 'boolean';
  }

  goBack(): void {
    this.location.back();
  }

  // Nuevo helper: devuelve el objeto { valor, usuario } o null si no existe
  getCell(entrada: string, fecha: string): { valor?: any, usuario?: string } | null {
    if (!this.tablaValores) return null;
    const entradaObj = this.tablaValores[entrada];
    if (!entradaObj) return null;
    return entradaObj[fecha] || null;
  }

  // Nuevo: devuelve el primer usuario encontrado para una fecha (o null)
  getUsuarioByFecha(fecha: string): string | null {
    if (!this.tablaValores || !this.entradas) return null;
    for (const entrada of this.entradas) {
      const cell = this.getCell(entrada, fecha);
      if (cell && cell.usuario) {
        return cell.usuario;
      }
    }
    return null;
  }

  uniqueFechas(fechas: string[]): string[] {
    const seen = new Set<string>();
    return fechas.filter(fecha => {
      const day = new Date(fecha).toISOString().substring(0, 10);
      if (seen.has(day)) return false;
      seen.add(day);
      return true;
    });
  }
}
