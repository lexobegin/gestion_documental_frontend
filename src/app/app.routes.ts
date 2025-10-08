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
// Especialidades Alison
import { EspecialidadListComponent } from './components/especialidad/especialidad-list/especialidad-list.component';
import { EspecialidadCreateComponent } from './components/especialidad/especialidad-create/especialidad-create.component';
import { EspecialidadUpdateComponent } from './components/especialidad/especialidad-update/especialidad-update.component';

import { RolesListComponent } from './components/roles/roles-list/roles-list.component';
import { RolesCreateComponent } from './components/roles/roles-create/roles-create.component';
import { RolesEditComponent } from './components/roles/roles-edit/roles-edit.component';
import { PermisosCreateComponent } from './components/permisos/permisos-create/permisos-create.component';
import { CitaListComponent } from './components/cita/cita-list/cita-list.component';
import { CitaCreateComponent } from './components/cita/cita-create/cita-create.component';
import { CitaUpdateComponent } from './components/cita/cita-update/cita-update.component';
import { BackupListComponent } from './components/backup/backup-list/backup-list.component';

// Bitácora - NUEVA IMPORTACIÓN CON LA ESTRUCTURA CORRECTA
import { BitacoraListComponent } from './components/bitacora/bitacora-list/bitacora-list.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      //Dashboard
      { path: 'dashboard', component: DashboardComponent },

      //Citas
      { path: 'citas', component: CitaListComponent },
      { path: 'citas/crear', component: CitaCreateComponent },
      { path: 'citas/editar/:id', component: CitaUpdateComponent },

      //Backup/Restore
      { path: 'backups', component: BackupListComponent },

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

      // Especialidades Alison
      { path: 'especialidades', component: EspecialidadListComponent },
      { path: 'especialidades/crear', component: EspecialidadCreateComponent },
      {
        path: 'especialidades/editar/:id',
        component: EspecialidadUpdateComponent,
      },

      // Bitácora - NUEVA RUTA
      { path: 'bitacora', component: BitacoraListComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'dashboard' },
];