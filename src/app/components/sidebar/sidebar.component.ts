import { Component, OnInit } from '@angular/core';
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
        { title: 'Paciente', route: '/dashboard' },
      ],
    },
    {
      title: 'Historia Clinica',
      expanded: false,
      children: [
        { title: 'Consulta', route: '/consultas' },
        { title: 'Citas Medicas', route: '/citas' },
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
  ];

  toggleMenu(menu: any) {
    menu.expanded = !menu.expanded;
  }

  getMenuIcon(menuTitle: string): string {
    const icons: { [key: string]: string } = {
      'Home': 'fas fa-home',
      'Usuarios': 'fas fa-users',
      'Agenda Medica': 'fas fa-calendar-alt',
      'Historia Clinica': 'fas fa-file-medical',
      'Sistema': 'fas fa-cogs'
    };
    return icons[menuTitle] || 'fas fa-circle';
  }

  getChildIcon(childTitle: string): string {
    const icons: { [key: string]: string } = {
      'Usuario': 'fas fa-user',
      'Roles y Permisos': 'fas fa-user-shield',
      'Especialidades': 'fas fa-stethoscope',
      'Horario': 'fas fa-clock',
      'Paciente': 'fas fa-user-injured',
      'Consulta': 'fas fa-notes-medical',
      'Citas Medicas': 'fas fa-calendar-check',
      'Bitacora': 'fas fa-clipboard-list',
      'Backup/Restore': 'fas fa-database'
    };
    return icons[childTitle] || 'fas fa-circle';
  }
}