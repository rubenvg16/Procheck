import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from './data-access/dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStateService } from '../shared/data-access/auth-state.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Conexion } from './data-access/dashboard.model';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, NavbarComponent],
  standalone: true
})
export default class DashboardComponent implements OnInit, OnDestroy {
  
  // Variable para almacenar la información decodificada del token
  decodedToken: any;
  nombreConexion: any; 
  checklists: string[] = [];
  checklistPorConexion: Conexion[] = [];
  mostrarInactivas: boolean = false;
  isLoading = true;
  noConexiones: boolean = false;

  contextMenuVisible = false;
  contextMenuPosition = { x: '0px', y: '0px' };
  contextMenuChecklist: any = null;
  contextMenuConexion: any = null;
  showDuplicateMenu = false;
  duplicateMenuPosition = { x: '0px', y: '0px' };
  userConexiones: any[] = [];

  // Nuevo: estado de UI para selección y búsqueda
  selectedConexionIndex: number | null = null;
  selectedConexion: any = null;
  searchQuery: string = '';

  // Mensajes generales tipo toast
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  showProgressBar = false;
  fadeOutMessage = false;

  // Estadísticas y actividad reciente
  totalLists: number = 0;
  activeLists: number = 0;
  inactiveLists: number = 0;
  recentActivities: { title: string; subtitle?: string; when?: string }[] = [];

  constructor(
    private dashboardService: DashboardService, 
    private authStateService: AuthStateService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      const checklistsData = data['checklists'];
      // Si el backend devuelve un error o un array vacío
      if (
        (Array.isArray(checklistsData) && checklistsData.length === 0) ||
        (checklistsData && typeof checklistsData === 'object' && checklistsData.error)
      ) {
        this.noConexiones = true;
        this.checklistPorConexion = [];
      } else if (Array.isArray(checklistsData)) {
        this.noConexiones = false;
        this.checklistPorConexion = checklistsData;
        // Inicializar el estado de expansión para cada conexión
        this.checklistPorConexion.forEach(conexion => {
          conexion.isExpanded = false;
        });
        // Seleccionar la primera conexión por defecto (diseño nuevo)
        if (this.checklistPorConexion.length > 0) {
          this.selectConexion(0);
        }
      } else {
        // fallback defensivo
        this.noConexiones = true;
        this.checklistPorConexion = [];
      }
      // Después de asignar checklistPorConexion:
      this.updateStats();
      this.isLoading = false;
    });

    // Cargar conexiones del usuario para el menú de duplicar
    this.dashboardService.getUserConexiones().subscribe({
      next: (data: any) => {
        this.userConexiones = data.conexiones || data;
      },
      error: () => {
        this.userConexiones = [];
      }
    });

    document.addEventListener('click', this.closeContextMenuBound);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeContextMenuBound);
  }

  // Necesario para remover correctamente el listener
  private closeContextMenuBound = () => this.closeContextMenu();

  toggleConexion(index: number): void {
    this.checklistPorConexion[index].isExpanded = !this.checklistPorConexion[index].isExpanded;
  }

  public loadChecklists(): void {
    this.isLoading = true;
    this.dashboardService.getChecklists().subscribe({
      next: (data) => {
        this.checklistPorConexion = data;
        // actualizar estado/expansión defensivo
        this.checklistPorConexion.forEach(conexion => conexion.isExpanded = conexion.isExpanded || false);
        this.updateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener checklists', error);
        this.isLoading = false;
      }
    });
  }

  // Nuevo: actualizar contadores y actividad reciente basada en los checklists
  private updateStats(): void {
    const normalizeAlta = (v: any) => v === true || v === 1 || v === '1' || v === 'true';
    const all = this.checklistPorConexion.reduce((acc: any[], c: any) => {
      if (c && Array.isArray(c.checklists)) {
        acc.push(...c.checklists.map((ch: any) => ({ ...ch, _fromConexion: c.nombreConexion || '' })));
      }
      return acc;
    }, []);
    this.totalLists = all.length;
    this.activeLists = all.filter(l => normalizeAlta(l.alta)).length;
    this.inactiveLists = this.totalLists - this.activeLists;

    // Recent activity: tomar up to 6 items. Si hay timestamps (updatedAt/createdAt) ordenarlos, si no usar orden natural.
    const withWhen = all.map(a => ({
      ...a,
      _whenSort: a.updatedAt || a.createdAt || 0
    }));
    withWhen.sort((x: any, y: any) => {
      // si ambos 0, mantener orden
      return (y._whenSort || 0) - (x._whenSort || 0);
    });
    this.recentActivities = withWhen.slice(0, 6).map((r: any) => ({
      title: r.nombre || `Lista ${r.id || ''}`,
      subtitle: r._fromConexion || '',
      when: r.updatedAt || r.createdAt ? String(r.updatedAt || r.createdAt) : ''
    }));
  }

  logout(): void {
    // Elimina el token del localStorage
    localStorage.removeItem('session');
    // Si tienes lógica adicional en AuthStateService, puedes llamarla también:
    this.authStateService.signOut?.();
    // Redirige al login en el otro dominio
    window.location.href = 'http://localhost:4200/log-in';
  }

  toggleInactives(event: any): void {
    this.mostrarInactivas = event.target.checked;
  }

  // Función que devuelve para cada conexión el array de checklists filtrado:
  getChecklistsByConexion(conexion: any): any[] {
    if (!conexion || !conexion.checklists) {
      return [];
    }
  
    console.log('Conexión:', conexion);

    const activas = conexion.checklists.filter((checklist: any) => 
      checklist.alta === true || checklist.alta === 1 || checklist.alta === '1' || checklist.alta === 'true'
    );
  
    const inactivas = conexion.checklists.filter((checklist: any) =>
      !(checklist.alta === true || checklist.alta === 1 || checklist.alta === '1' || checklist.alta === 'true')
    );
  
    if (this.mostrarInactivas) {
      return [...activas, ...inactivas]; // Primero activas, luego inactivas
    } else {
      return activas;
    }
  }

  navigateToList(checklist: any) {
    if (this.noConexiones) {
      // No permitir navegación si no tiene permisos/conexiones
      return;
    }
    if (checklist && checklist.id) {
      this.router.navigate(['/listas', checklist.id]);
    } else {
      console.error('Checklist ID not found:', checklist);
    }
  }

  openContextMenu(event: MouseEvent, checklist: any, conexion: any) {
    event.preventDefault();
    this.contextMenuVisible = true;
    this.contextMenuPosition = { x: event.clientX + 'px', y: event.clientY + 'px' };
    this.contextMenuChecklist = checklist;
    this.contextMenuConexion = conexion;
    this.showDuplicateMenu = false;
  }

  closeContextMenu() {
    this.contextMenuVisible = false;
    this.showDuplicateMenu = false;
  }

  onEnterList() {
    this.navigateToList(this.contextMenuChecklist);
    this.closeContextMenu();
  }

  public showSuccessMessage(msg: string): void {
    this.message = msg;
    this.messageType = 'success';
    this.showProgressBar = true;
    this.fadeOutMessage = false;
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
    this.showProgressBar = false;
    this.fadeOutMessage = false;
    setTimeout(() => {
      this.fadeOutMessage = true;
      setTimeout(() => {
        this.message = '';
        this.fadeOutMessage = false;
      }, 300);
    }, 3000);
  }

  onSetInactive() {
    if (!this.contextMenuChecklist?.id) {
      this.closeContextMenu();
      return;
    }
    this.dashboardService.setListInactive(this.contextMenuChecklist.id).subscribe({
      next: () => {
        this.contextMenuChecklist.alta = 0;
        this.showSuccessMessage('Lista marcada como inactiva');
        this.closeContextMenu();
        this.updateStats(); // actualizar contadores
      },
      error: () => {
        this.showErrorMessage('Error al marcar la lista como inactiva');
        this.closeContextMenu();
      }
    });
  }

  onToggleActive() {
    if (!this.contextMenuChecklist?.id) {
      this.closeContextMenu();
      return;
    }
    const newAlta = this.contextMenuChecklist.alta ? 0 : 1;
    this.dashboardService.setListInactive(this.contextMenuChecklist.id, newAlta).subscribe({
      next: () => {
        this.contextMenuChecklist.alta = newAlta;
        this.showSuccessMessage(
          newAlta ? 'Lista marcada como activa' : 'Lista marcada como inactiva'
        );
        this.closeContextMenu();
        this.updateStats(); // actualizar contadores
      },
      error: () => {
        this.showErrorMessage('Error al cambiar el estado de la lista');
        this.closeContextMenu();
      }
    });
  }

  onDuplicateHover(event: MouseEvent) {
    this.showDuplicateMenu = true;
    this.duplicateMenuPosition = { x: event.clientX + 180 + 'px', y: event.clientY + 'px' };
  }

  // Nuevo: seleccionar conexión desde la sidebar (indice)
  selectConexion(index: number | null): void {
    if (index === null) {
      this.selectedConexionIndex = null;
      this.selectedConexion = null;
      return;
    }
    // defensiva: rango válido
    if (index < 0 || index >= this.checklistPorConexion.length) {
      this.selectedConexionIndex = null;
      this.selectedConexion = null;
      return;
    }
    this.selectedConexionIndex = index;
    this.selectedConexion = this.checklistPorConexion[index] || null;
  }

  // Nuevo: obtiene listas a mostrar respetando mostrarInactivas y búsqueda
  getDisplayedChecklists(): any[] {
    const normalizeAlta = (v: any) => v === true || v === 1 || v === '1' || v === 'true';

    const filterLists = (lists: any[] = []) => {
      const q = (this.searchQuery || '').toString().trim().toLowerCase();
      return (lists || []).filter((checklist: any) => {
        const isActive = normalizeAlta(checklist.alta);
        if (!this.mostrarInactivas && !isActive) return false;
        if (q.length > 0) {
          return String(checklist.nombre || '').toLowerCase().includes(q);
        }
        return true;
      }).sort((a: any, b: any) => {
        const aActive = normalizeAlta(a.alta) ? 0 : 1;
        const bActive = normalizeAlta(b.alta) ? 0 : 1;
        return aActive - bActive;
      });
    };

    if (this.selectedConexion) {
      return filterLists(this.selectedConexion.checklists || []);
    }

    // combinar todas las conexiones
    const all = this.checklistPorConexion.reduce((acc: any[], c: any) => {
      if (c && Array.isArray(c.checklists)) {
        acc.push(...c.checklists.map((ch: any) => ({ ...ch, _fromConexion: c.nombreConexion })));
      }
      return acc;
    }, []);
    return filterLists(all);
  }

  onDuplicateToConexion(conexion: any) {
    if (!this.contextMenuChecklist?.id || !conexion?.nombreConexion) {
      this.closeContextMenu();
      return;
    }
    this.dashboardService.duplicateList(this.contextMenuChecklist.id, conexion.nombreConexion).subscribe({
      next: () => {
        this.showSuccessMessage('Checklist duplicada correctamente');
        this.closeContextMenu();
        // refrescar listados
        this.loadChecklists();
        // loadChecklists llamará updateStats
      },
      error: () => {
        this.showErrorMessage('Error al duplicar la checklist');
        this.closeContextMenu();
      }
    });
  }
}