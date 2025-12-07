import { Routes } from '@angular/router';
import { UserLoginComponent } from './log-in/log-in.component';
import { UserListsComponent } from './user-lists/user-lists.component';
import { ListaDetalleComponent } from './lista-detalle/lista-detalle.component';

export const routes: Routes = [
    { path: '', component: UserLoginComponent },
    // Ruta raíz ('/'): muestra el componente de login.

    { path: 'listas', component: UserListsComponent },
    // Ruta '/listas': muestra el componente con las listas del usuario.

    { path: 'lista/:id', component: ListaDetalleComponent }
    // Ruta '/lista/:id': muestra el detalle de una lista específica, usando el parámetro 'id'.

];
