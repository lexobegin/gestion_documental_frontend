import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RolService } from '../../../services/rol/rol.service';

@Component({
  selector: 'app-roles-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-create.component.html',
  styleUrls: []
})
export class RolesCreateComponent {
  nombre = '';
  descripcion = '';
  loading = false;
  success: string | null = null;
  error: string | null = null;

  constructor(private rolService: RolService, private router: Router) {}

  crearRol() {
    this.loading = true;
    this.success = null;
    this.error = null;

    // Enviar el campo correcto 'nombre_rol' según backend
    this.rolService.create({ nombre_rol: this.nombre, descripcion: this.descripcion }).subscribe({
      next: () => {
        this.success = 'Rol creado correctamente';
        this.nombre = '';
        this.descripcion = '';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Error al crear el rol';
        this.loading = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/roles']);
  }
}
