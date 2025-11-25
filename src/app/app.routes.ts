import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth/auth.guard';
//import { DashboardComponent } from './components/home/dashboard/dashboard.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/auth/login/login.component';

// Auto
import { AutoListComponent } from './components/auto/auto-list/auto-list.component';
import { AutoCreateComponent } from './components/auto/auto-create/auto-create.component';
import { AutoUpdateComponent } from './components/auto/auto-update/auto-update.component';

// Usuarios
import { UsuarioListComponent } from './components/usuario/usuario-list/usuario-list.component';
import { UsuarioCreateComponent } from './components/usuario/usuario-create/usuario-create.component';
import { UsuarioUpdateComponent } from './components/usuario/usuario-update/usuario-update.component';

// Especialidades
import { EspecialidadListComponent } from './components/especialidad/especialidad-list/especialidad-list.component';
import { EspecialidadCreateComponent } from './components/especialidad/especialidad-create/especialidad-create.component';
import { EspecialidadUpdateComponent } from './components/especialidad/especialidad-update/especialidad-update.component';

// Roles y Permisos
import { RolesListComponent } from './components/roles/roles-list/roles-list.component';
import { RolesCreateComponent } from './components/roles/roles-create/roles-create.component';
import { RolesEditComponent } from './components/roles/roles-edit/roles-edit.component';
import { PermisosCreateComponent } from './components/permisos/permisos-create/permisos-create.component';

// Citas
import { CitaListComponent } from './components/cita/cita-list/cita-list.component';
import { CitaCreateComponent } from './components/cita/cita-create/cita-create.component';
import { CitaUpdateComponent } from './components/cita/cita-update/cita-update.component';
import { CitaCalendarioComponent } from './components/cita/cita-calendario/cita-calendario.component';

// Backups
import { BackupListComponent } from './components/backup/backup-list/backup-list.component';

// Horarios Médicos
import { HorarioMedicoListComponent } from './components/horario/list/horario-medico-list.component';
import { HorarioMedicoCreateComponent } from './components/horario/create/horario-medico-create.component';
import { HorarioMedicoUpdateComponent } from './components/horario/update/horario-medico-update.component';

// Bitácora
import { BitacoraListComponent } from './components/bitacora/bitacora-list/bitacora-list.component';

// Pacientes
import { PacienteListComponent } from './components/paciente/paciente-list/paciente-list.component';
import { PacienteCreateComponent } from './components/paciente/paciente-create/paciente-create.component';
import { PacienteUpdateComponent } from './components/paciente/paciente-update/paciente-update.component';

// Consultas Médicas
import { ConsultaListComponent } from './components/consulta/consulta-list/consulta-list.component';
import { ConsultaCreateComponent } from './components/consulta/consulta-create/consulta-create.component';
import { ConsultaUpdateComponent } from './components/consulta/consulta-update/consulta-update.component';
import { ConsultaExamenesComponent } from './components/consulta/consulta-examenes/consulta-examenes.component';

// Recetas
import { RecetaListComponent } from './components/Recetas-Alison/list/receta-list.component';
import { RecetaCreateComponent } from './components/Recetas-Alison/create/receta-create.component';
import { RecetaUpdateComponent } from './components/Recetas-Alison/update/receta-update.component';


// *** GESTIÓN DE EXÁMENES MÉDICOS ***
import { ExamenListComponent } from './components/examen/examen-list/examen-list.component';
import { NotificacionListComponent } from './components/notificacion/notificacion-list/notificacion-list.component';
import { NotificacionCreateComponent } from './components/notificacion/notificacion-create/notificacion-create.component';
import { NotificacionUpdateComponent } from './components/notificacion/notificacion-update/notificacion-update.component';
import { AgendaCitaComponent } from './components/agenda/agenda-cita/agenda-cita.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      { path: 'dashboard', component: DashboardComponent },
      

      // Citas
      { path: 'citas', component: CitaListComponent },
      { path: 'citas/crear', component: CitaCreateComponent },
      { path: 'citas/editar/:id', component: CitaUpdateComponent },
      { path: 'citas/calendario', component: CitaCalendarioComponent },

      // Agenda Cita
      { path: 'agenda', component: AgendaCitaComponent },

      // Backups
      { path: 'backups', component: BackupListComponent },

      // Autos
      { path: 'autos', component: AutoListComponent },
      { path: 'autos/crear', component: AutoCreateComponent },
      { path: 'autos/editar/:id', component: AutoUpdateComponent },

      // Notificaciones
      { path: 'notificacion', component: NotificacionListComponent },
      { path: 'notificacion/crear', component: NotificacionCreateComponent },
      {
        path: 'notificacion/editar/:id',
        component: NotificacionUpdateComponent,
      },

      // Usuarios
      { path: 'usuarios', component: UsuarioListComponent },
      { path: 'usuarios/crear', component: UsuarioCreateComponent },
      { path: 'usuarios/editar/:id', component: UsuarioUpdateComponent },

      // Pacientes
      { path: 'pacientes', component: PacienteListComponent },
      { path: 'pacientes/crear', component: PacienteCreateComponent },
      { path: 'pacientes/editar/:id', component: PacienteUpdateComponent },

      // Roles y Permisos
      { path: 'roles', component: RolesListComponent },
      { path: 'roles/crear', component: RolesCreateComponent },
      { path: 'roles/editar/:id', component: RolesEditComponent },
      { path: 'permisos/crear', component: PermisosCreateComponent },

      // Especialidades
      { path: 'especialidades', component: EspecialidadListComponent },
      { path: 'especialidades/crear', component: EspecialidadCreateComponent },
      {
        path: 'especialidades/editar/:id',
        component: EspecialidadUpdateComponent,
      },

      // Bitácora
      { path: 'bitacora', component: BitacoraListComponent },

      // Horarios
      { path: 'horarios', component: HorarioMedicoListComponent },
      { path: 'horarios/create', component: HorarioMedicoCreateComponent },
      { path: 'horarios/update/:id', component: HorarioMedicoUpdateComponent },

      // Consultas
      { path: 'consultas/lista', component: ConsultaListComponent },
      { path: 'consulta-create', component: ConsultaCreateComponent },
      { path: 'consulta-update/:id', component: ConsultaUpdateComponent },
      { path: 'consulta-examenes/:id', component: ConsultaExamenesComponent },


      // Recetas
      { path: 'recetas', component: RecetaListComponent },
      { path: 'recetas/crear', component: RecetaCreateComponent },
      { path: 'recetas/editar/:id', component: RecetaUpdateComponent },

      // *** GESTIÓN DE EXÁMENES MÉDICOS ***
      { path: 'examen', component: ExamenListComponent }, // Ruta directa
      { path: 'historia-clinica/examenes', component: ExamenListComponent }, // Ruta dentro de Historia Clínica

      // Default
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Login y fallback
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'dashboard' },
];
