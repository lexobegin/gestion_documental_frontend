import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth/auth.guard';
import { DashboardComponent } from './components/home/dashboard/dashboard.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AutoListComponent } from './components/auto/auto-list/auto-list.component';
import { AutoCreateComponent } from './components/auto/auto-create/auto-create.component';
import { AutoUpdateComponent } from './components/auto/auto-update/auto-update.component';
import { UsuarioListComponent } from './components/usuario/usuario-list/usuario-list.component';
import { UsuarioCreateComponent } from './components/usuario/usuario-create/usuario-create.component';
import { UsuarioUpdateComponent } from './components/usuario/usuario-update/usuario-update.component';

import { RolesListComponent } from './components/roles/roles-list/roles-list.component';
import { RolesCreateComponent } from './components/roles/roles-create/roles-create.component';
import { RolesEditComponent } from './components/roles/roles-edit/roles-edit.component';
import { PermisosCreateComponent } from './components/permisos/permisos-create/permisos-create.component';


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      //Dashboard
      { path: 'dashboard', component: DashboardComponent },

      //Auto
      { path: 'autos', component: AutoListComponent },
      { path: 'autos/crear', component: AutoCreateComponent },
      { path: 'autos/editar/:id', component: AutoUpdateComponent },

      // Usuarios
      { path: 'usuarios', component: UsuarioListComponent },
      { path: 'usuarios/crear', component: UsuarioCreateComponent },
      { path: 'usuarios/editar/:id', component: UsuarioUpdateComponent },

      // Roles
      { path: 'roles', component: RolesListComponent },
      { path: 'roles/crear', component: RolesCreateComponent },
      { path: 'roles/editar/:id', component: RolesEditComponent },

      // Permisos
      { path: 'permisos/crear', component: PermisosCreateComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'dashboard' },
];
