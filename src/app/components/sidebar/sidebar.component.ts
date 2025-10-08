import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'], // ojo: plural
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
        { title: 'Horario', route: '/dashboard' },
        { title: 'Paciente', route: '/dashboard' },
      ],
    },
    {
      title: 'Historia Clinica',
      expanded: false,
      children: [
        { title: 'Consulta', route: '/dashboard' },
        { title: 'Citas Medicas', route: '/citas' },
      ],
    },
    {
      title: 'Sistema',
      expanded: false,
      children: [
        { title: 'Bitacora', route: '/dashboard' },
        { title: 'Backup/Restore', route: '/backups' },
      ],
    },
  ];

  toggleMenu(menu: any) {
    menu.expanded = !menu.expanded;
  }
}
