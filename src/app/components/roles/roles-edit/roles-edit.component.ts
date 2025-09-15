import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RolService } from '../../../services/rol/rol.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-roles-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-edit.component.html',
  styleUrl: './roles-edit.component.scss'
})
export class RolesEditComponent implements OnInit {
  nombre: string = '';
  permisos: any[] = [];
  mensaje: string | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private rolService: RolService, private http: HttpClient) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // 1. Obtener nombre del rol
    this.http.get<any>(`http://localhost:8000/api/roles/${id}/`).subscribe({
      next: (rol) => {
        this.nombre = rol.nombre || rol.nombre_rol || '';
        // 2. Obtener permisos del rol
        this.rolService.getRolConPermisos(id).subscribe({
          next: (data) => {
            const permisosRol = Array.isArray(data) ? data : (data.permisos || []);
            const idsPermisosRol = permisosRol.map((p: any) => p.id);
            // 3. Obtener todos los permisos
            this.http.get<any>('http://localhost:8000/api/permisos').subscribe({
              next: (todos) => {
                const permisosTodos = Array.isArray(todos) ? todos : (todos.results || []);
                this.permisos = permisosTodos.map((p: any) => ({
                  id: p.id,
                  nombre: p.nombre,
                  descripcion: p.descripcion,
                  seleccionado: idsPermisosRol.includes(p.id)
                }));
                this.loading = false;
              },
              error: () => {
                this.mensaje = 'Error al cargar todos los permisos';
                this.loading = false;
              }
            });
          },
          error: () => {
            this.mensaje = 'Error al cargar permisos del rol';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.mensaje = 'Error al cargar el nombre del rol';
        this.loading = false;
      }
    });
  }

  togglePermiso(permiso: any) {
    permiso.seleccionado = !permiso.seleccionado;
  }

  guardar() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const permisosSeleccionados = this.permisos.filter(p => p.seleccionado).map(p => p.id);
    // Guardar nombre del rol
    this.http.patch(`http://localhost:8000/api/roles/${id}/`, { nombre_rol: this.nombre }).subscribe({
      next: () => {
        // Guardar permisos después de actualizar el nombre
        this.rolService.updatePermisosRol(id, permisosSeleccionados).subscribe({
          next: () => {
            this.mensaje = 'Cambios guardados correctamente';
          },
          error: () => {
            this.mensaje = 'Error al guardar permisos';
          }
        });
      },
      error: () => {
        this.mensaje = 'Error al guardar el nombre del rol';
      }
    });
  }
}
