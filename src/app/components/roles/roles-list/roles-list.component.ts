import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolService, Rol } from '../../../services/rol/rol.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent implements OnInit {
  roles: Rol[] = [];
  loading = false;
  error: string | null = null;

  eliminandoId: number | null = null;
  mensaje: string | null = null;

  constructor(private rolService: RolService, private router: Router) { }

  ngOnInit(): void {
    this.loading = true;
    this.rolService.list().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar roles';
        this.loading = false;
      }
    });
  }

  editarRol(id: number) {
    this.router.navigate(['/roles/editar', id]);
  }

  eliminarRol(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este rol?')) return;
    this.eliminandoId = id;
    this.rolService.delete(id).subscribe({
      next: () => {
        this.roles = this.roles.filter(r => r.id !== id);
        this.mensaje = 'Rol eliminado correctamente';
        this.eliminandoId = null;
      },
      error: () => {
        this.mensaje = 'Error al eliminar el rol';
        this.eliminandoId = null;
      }
    });
  }

  irCrearRol() {
    this.router.navigate(['/roles/crear']);
  }

  irCrearPermiso() {
    this.router.navigate(['/permisos/crear']);
  }
}
