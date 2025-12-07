import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-user-lists',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './user-lists.component.html',
  styleUrls: ['./user-lists.component.css']
})
export class UserListsComponent implements OnInit, OnDestroy {
  listas: any[] = []; //para almacenar las listas obtenidas del backend
  locales: string[] = []; //para almacenar los locales asociados al usuario.
  username = ''; //para almacenar el nombre de usuario
  groupedListas: { [local: string]: any[] } = {}; //para almacenar las listas agrupadas por local.
  loading = true; //para mostrar un spinner de carga mientras se obtienen los datos.
  isDarkMode = false;

  // Nuevo estado estilo dashboard
  checklistPorConexion: any[] = []; // cada item: { nombreConexion: string, checklists: [] }
  selectedConexionIndex: number | null = null;
  selectedConexion: any = null;
  searchQuery: string = '';
  mostrarInactivas: boolean = false;

  // Menú contextual y mensajes
  contextMenuVisible = false;
  contextMenuPosition = { x: '0px', y: '0px' };
  contextMenuChecklist: any = null;

  message = '';
  messageType: 'success' | 'error' = 'success';
  showProgressBar = false;
  fadeOutMessage = false;

  constructor(private router: Router, private loginService: LoginService) {
    const nav = this.router.getCurrentNavigation(); // Obtiene la navegación actual (si existe).
    const state = nav?.extras.state as any; // Obtiene el estado pasado por la navegación (si existe).
    this.locales = state?.locales || []; // Inicializa locales con el estado recibido o un array vacío.
    this.username = state?.username || ''; // Inicializa username con el estado recibido o cadena vacía.
  }

  ngOnInit() {
    this.loading = true; // Activa el loader al iniciar la carga de datos.
    this.username = this.loginService.getCurrentUsername(); // Obtiene el nombre de usuario almacenado en localStorage.
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.setDarkMode(this.isDarkMode);
    //console.log('Username:', this.username);
    if (this.username) {
      this.loginService.getUserLocales(this.username).subscribe(locales => { // Llama al backend para obtener los locales del usuario.
        //console.log('Locales:', locales);
        this.locales = locales;
        this.loginService.getListasByLocales(locales).subscribe(lists => { // Llama al backend para obtener las listas de esos locales.
          //console.log('Listas:', lists);
          this.listas = lists;
          this.groupedListas = this.listas.reduce((acc, lista) => { // Agrupa las listas por local.
            acc[lista.local] = acc[lista.local] || [];
            acc[lista.local].push(lista);
            return acc;
          }, {} as { [local: string]: any[] });
          // Construir checklistPorConexion similar al dashboard
          this.checklistPorConexion = (this.locales.length ? this.locales : Object.keys(this.groupedListas)).map(local => {
            return {
              nombreConexion: local,
              checklists: (this.groupedListas[local] || []).map((l: any) => ({ ...l }))
            };
          });

          // seleccionar la primera por defecto si existe
          if (this.checklistPorConexion.length > 0) {
            this.selectConexion(0);
          }

          this.loading = false; // Desactiva el loader cuando termina de cargar.
        }, () => {
          this.loading = false;
        });
      }, () => {
        this.loading = false;
      });
    } else {
      this.loading = false; // Si no hay username, desactiva el loader.
    }

    document.addEventListener('click', this.closeContextMenuBound);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeContextMenuBound);
  }

  // Cierre del menú contextual (bound para add/remove event)
  private closeContextMenuBound = () => this.closeContextMenu();

  toggleDarkMode() { //Alternar el modo oscuro de la aplicación
    this.isDarkMode = !this.isDarkMode; //Invierte el valor actual de `isDarkMode` (si está activado, lo desactiva y viceversa)
    this.setDarkMode(this.isDarkMode); //Llama al método `setDarkMode` pasando el nuevo valor de `isDarkMode` para aplicar el cambio visualmente
    localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false'); //Guarda el estado actual de `isDarkMode` en el `localStorage` como 'true' o 'false' para persistir la preferencia del usuario
  }

  setDarkMode(enabled: boolean) {
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  logout() {// Limpia y redirige al login.
    localStorage.clear();
    sessionStorage.clear();
    document.body.classList.remove('dark-mode');
    this.router.navigate(['/']);
  }

  goToLista(lista: any) {
    this.router.navigate(['/lista', lista.idlista], {
      state: {
        lista,
        username: this.username,
        local: lista.local
      }
    });
  }

  // Selección de "conexion" (local) desde el sidebar
  selectConexion(index: number | null): void {
    if (index === null) {
      this.selectedConexionIndex = null;
      this.selectedConexion = null;
      return;
    }
    if (index < 0 || index >= this.checklistPorConexion.length) {
      this.selectedConexionIndex = null;
      this.selectedConexion = null;
      return;
    }
    this.selectedConexionIndex = index;
    this.selectedConexion = this.checklistPorConexion[index] || null;
  }

  toggleInactives(event: any): void {
    this.mostrarInactivas = !!event?.target?.checked;
  }

  // Obtener listas mostradas respetando búsqueda y filtro de inactivas
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

    const all = this.checklistPorConexion.reduce((acc: any[], c: any) => {
      if (c && Array.isArray(c.checklists)) {
        acc.push(...c.checklists.map((ch: any) => ({ ...ch, _fromConexion: c.nombreConexion })));
      }
      return acc;
    }, []);
    return filterLists(all);
  }

  // Menú contextual
  openContextMenu(event: MouseEvent, checklist: any, conexion: any) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuVisible = true;
    this.contextMenuPosition = { x: event.clientX + 'px', y: event.clientY + 'px' };
    this.contextMenuChecklist = checklist;
  }

  closeContextMenu() {
    this.contextMenuVisible = false;
    this.contextMenuChecklist = null;
  }

  onEnterList() {
    this.goToLista(this.contextMenuChecklist);
    this.closeContextMenu();
  }

  onToggleActive() {
    if (!this.contextMenuChecklist) {
      this.closeContextMenu();
      return;
    }
    // Cambio local UI-only (si existe endpoint puede integrarse aquí)
    const newAlta = this.contextMenuChecklist.alta ? 0 : 1;
    this.contextMenuChecklist.alta = newAlta;
    this.showSuccessMessage(newAlta ? 'Lista marcada como activa' : 'Lista marcada como inactiva');
    this.closeContextMenu();
  }

  // Mensajes toast
  private showSuccessMessage(msg: string): void {
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
}
