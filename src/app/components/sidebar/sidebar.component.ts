import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  menus = [
    { title: 'Home', route: '/dashboard', expanded: false, children: [] },

    {
      title: 'Usuarios',
      expanded: false,
      children: [
        { title: 'Usuario', route: '/usuarios' },
        { title: 'Roles y Permisos', route: '/roles' },
        { title: 'Especialidades', route: '/especialidades' },
      ],
    },
    {
      title: 'Agenda Medica',
      expanded: false,
      children: [
        { title: 'Horario', route: '/horarios' },
        { title: 'Paciente', route: '/pacientes' },
        { title: 'Agenda', route: '/agenda' },
        { title: 'Citas Medicas', route: '/citas' },
      ],
    },
    {
      title: 'Historia Clinica',
      expanded: false,
      children: [
        // Corrección: ruta actualizada a /consultas/lista
        { title: 'Consulta', route: '/consultas/lista' },
        { title: 'Receta', route: '/recetas' },
        { title: 'Examen', route: '/examen' },
        { title: 'Historial Medico', route: '/historial-medico' },
        { title: 'Seguimiento', route: '/seguimiento' },
      ],
    },
    {
      title: 'Blockchain y Notificacion',
      expanded: false,
      children: [
        // Corrección: ruta actualizada a /consultas/lista
        { title: 'Auditoria', route: 'auditoria' },
        { title: 'Notificacion', route: 'noticacion' },
        { title: 'Consentimientos', route: '/consentimientos' },
      ],
    },
    {
      title: 'Sistema',
      expanded: false,
      children: [
        { title: 'Bitacora', route: '/bitacora' },
        { title: 'Backup/Restore', route: '/backups' },
      ],
    },
    { title: 'Reporte', route: '/reporte', expanded: false, children: [] },
  ];

  toggleMenu(menu: any) {
    menu.expanded = !menu.expanded;
  }
}
