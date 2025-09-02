import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  menus = [
    { title: 'Home', route: '/dashboard', expanded: false, children: [] },

    {
      title: 'Usuarios',
      expanded: false,
      children: [
        { title: 'Usuarios', route: '/usuario' },
        { title: 'Roles', route: '/rol' },
        { title: 'Permisos', route: '/permiso' },
      ],
    },
    {
      title: 'Módulo',
      expanded: false,
      children: [
        { title: 'CU1', route: '/autos' },
        { title: 'CU2', route: '/tarea' },
        { title: 'CU3', route: '/estimacion' },
      ],
    },
  ];

  toggleMenu(menu: any) {
    menu.expanded = !menu.expanded;
  }
}
