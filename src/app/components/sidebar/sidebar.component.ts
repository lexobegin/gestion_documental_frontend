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
      ],
    },
    {
      title: 'Historia Clinica',
      expanded: false,
      children: [
        // 🔹 Corrección: ruta actualizada a /consultas/lista
        { title: 'Consulta', route: '/consultas/lista' },
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
}
