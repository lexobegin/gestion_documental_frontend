import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { RolService, Rol } from '../../../services/rol/rol.service';

interface UsuarioCreateVM {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  activo: boolean;
  id_rol: number | null;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-usuario-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuario-create.component.html',
  styleUrls: ['./usuario-create.component.scss'],
})
export class UsuarioCreateComponent implements OnInit {
  usuario: UsuarioCreateVM = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    activo: true,
    id_rol: null,          // se enviará como number
    password: '',
    confirmPassword: '',
  };

  roles: Rol[] = [];
  guardando = false;
  error?: string;
  mensaje?: string;

  constructor(
    private srv: UsuarioService,
    private rolSrv: RolService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.error = undefined;
    this.rolSrv.list().subscribe({
      next: (rs) => {
        this.roles = rs ?? [];
        // Debug útil
        console.log('Roles cargados:', this.roles);
      },
      error: (e) => {
        console.error(e);
        this.error = 'No se pudieron cargar los roles';
      },
    });
  }

  guardar(f: NgForm): void {
    this.error = undefined;
    this.mensaje = undefined;

    if (this.guardando) return;          // evita doble envío
    if (f.invalid) { this.error = 'Revisa los campos requeridos.'; return; }
    if (!this.usuario.id_rol) { this.error = 'Selecciona un rol.'; return; }

    // Validación de contraseña (mínimo 6 para coincidir con backend)
    if (!this.usuario.password || this.usuario.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.usuario.password !== this.usuario.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    const dto = this.buildDto(this.usuario);

    this.guardando = true;
    this.srv.crear(dto).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = 'Usuario creado';
        // Limpia el formulario y redirige (ajusta a tu preferencia)
        f.resetForm({ activo: true });
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.error = this.extractBackendError(err) || 'No se pudo crear';
        this.guardando = false;
      },
    });
  }

  /** Normaliza y limpia el payload para el backend */
  private buildDto(u: UsuarioCreateVM): any {
    const dto: any = {
      nombre: u.nombre?.trim(),
      apellido: u.apellido?.trim(),
      email: u.email?.trim().toLowerCase(),
      telefono: u.telefono?.trim() || undefined,
      activo: !!u.activo,
      id_rol: Number(u.id_rol),
      password: u.password
      // Si agregas más campos (direccion, fecha_nacimiento, genero), inclúyelos aquí.
    };
    // Elimina claves vacías/undefined para no ensuciar el body
    Object.keys(dto).forEach((k) => {
      const v = dto[k];
      if (v === undefined || v === '') delete dto[k];
    });
    return dto;
  }

  /** Intenta mostrar un mensaje útil desde DRF (detail o errores por campo) */
  private extractBackendError(err: any): string {
    const e = err?.error;
    if (!e) return '';
    if (typeof e === 'string') return e;
    if (e.detail) return e.detail;
    if (typeof e === 'object') {
      const msgs: string[] = [];
      for (const k of Object.keys(e)) {
        const val = e[k];
        if (Array.isArray(val)) msgs.push(`${k}: ${val.join(', ')}`);
        else if (typeof val === 'string') msgs.push(`${k}: ${val}`);
      }
      return msgs.join(' | ');
    }
    return '';
  }
}
