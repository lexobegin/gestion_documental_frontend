import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

interface ChildItem {
  title: string;
  route: string;
}
interface MenuItem {
  title: string;
  route?: string;
  expanded?: boolean;
  children?: ChildItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'], // ojo: plural
})
export class SidebarComponent implements OnInit {
  menus: MenuItem[] = [
    { title: 'Home', route: '/dashboard', expanded: false, children: [] },

    {
      title: 'Usuarios',
      expanded: false,
      children: [
        { title: 'Usuario', route: '/usuarios' },
        { title: 'Roles y Permisos', route: '/roles' },

        /*{ title: 'Crear usuario',     route: '/usuarios/crear' },
        { title: 'Roles',             route: '/rol' },
        { title: 'Permisos',          route: '/permiso' },*/
      ],
    },


    /*{
      title: 'Módulo',
      expanded: false,
      children: [
        { title: 'CU1', route: '/autos' },
        { title: 'CU2', route: '/tarea' },
        { title: 'CU3', route: '/estimacion' },
      ],
    },*/
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.syncExpandedWithUrl();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.syncExpandedWithUrl());
  }

  toggleMenu(menu: MenuItem) {
    menu.expanded = !menu.expanded;
  }

  private syncExpandedWithUrl() {
    const url = this.router.url;
    this.menus.forEach((m) => {
      if (m.children?.length) {
        m.expanded = m.children.some((c) => url.startsWith(c.route));
      }
    });
  }
}
