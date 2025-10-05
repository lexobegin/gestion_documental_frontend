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
    id_rol: null,
    password: '',
    confirmPassword: '',
  };

  roles: Rol[] = [];
  guardando = false;
  error?: string;
  mensaje?: string;
  submitted = false;

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
        console.log('Roles cargados:', this.roles);

        // Si solo hay un rol, seleccionarlo automáticamente
        if (this.roles.length === 1) {
          this.usuario.id_rol = this.roles[0].id;
        }
      },
      error: (e) => {
        console.error('Error cargando roles:', e);
        this.error = 'No se pudieron cargar los roles. Intente nuevamente.';
      },
    });
  }

  guardar(f: NgForm): void {
    this.submitted = true;
    this.error = undefined;
    this.mensaje = undefined;

    // Evita doble envío
    if (this.guardando) return;

    // Validación básica del formulario
    if (f.invalid) {
      this.error =
        'Por favor, complete todos los campos requeridos correctamente.';
      this.scrollToError();
      return;
    }

    // Validación de rol
    if (!this.usuario.id_rol) {
      this.error = 'Debe seleccionar un rol para el usuario.';
      this.scrollToError();
      return;
    }

    // Validación de contraseña
    if (!this.usuario.password || this.usuario.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      this.scrollToError();
      return;
    }

    if (this.usuario.password !== this.usuario.confirmPassword) {
      this.error = 'Las contraseñas no coinciden. Por favor, verifique.';
      this.scrollToError();
      return;
    }

    // Validación de email básica
    if (!this.isValidEmail(this.usuario.email)) {
      this.error = 'Por favor, ingrese un email válido.';
      this.scrollToError();
      return;
    }

    const dto = this.buildDto(this.usuario);

    this.guardando = true;
    this.srv.crear(dto).subscribe({
      next: (usuarioCreado) => {
        this.guardando = false;
        this.mensaje = `Usuario "${usuarioCreado.nombre} ${usuarioCreado.apellido}" creado exitosamente.`;

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/usuarios']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.error =
          this.extractBackendError(err) ||
          'No se pudo crear el usuario. Por favor, intente nuevamente.';
        this.guardando = false;
        this.scrollToError();
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
      password: u.password,
    };

    // Elimina campos vacíos/undefined
    Object.keys(dto).forEach((k) => {
      const v = dto[k];
      if (v === undefined || v === '' || v === null) delete dto[k];
    });

    console.log('DTO a enviar:', dto);
    return dto;
  }

  /** Valida formato de email */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /** Scroll al primer error */
  private scrollToError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  /** Intenta mostrar un mensaje útil desde DRF */
  private extractBackendError(err: any): string {
    const e = err?.error;
    if (!e) return 'Error de conexión. Verifique su internet.';

    if (typeof e === 'string') return e;

    if (e.detail) return e.detail;

    if (typeof e === 'object') {
      const msgs: string[] = [];

      // Mapeo de campos comunes
      const fieldMap: { [key: string]: string } = {
        email: 'Email',
        nombre: 'Nombre',
        apellido: 'Apellido',
        password: 'Contraseña',
        id_rol: 'Rol',
      };

      for (const k of Object.keys(e)) {
        const val = e[k];
        const fieldName = fieldMap[k] || k;

        if (Array.isArray(val)) {
          msgs.push(`${fieldName}: ${val.join(', ')}`);
        } else if (typeof val === 'string') {
          msgs.push(`${fieldName}: ${val}`);
        }
      }

      return msgs.length > 0
        ? msgs.join(' | ')
        : 'Error desconocido del servidor.';
    }

    return 'Error inesperado. Por favor, contacte al administrador.';
  }

  // Helper para verificar si las contraseñas coinciden (para uso en template)
  get passwordsMatch(): boolean {
    return this.usuario.password === this.usuario.confirmPassword;
  }

  // Helper para verificar si el formulario es válido
  get formValid(): boolean {
    return (
      !this.guardando &&
      this.usuario.nombre.length >= 2 &&
      this.usuario.apellido.length >= 2 &&
      this.isValidEmail(this.usuario.email) &&
      this.usuario.id_rol !== null &&
      this.usuario.password.length >= 6 &&
      this.passwordsMatch
    );
  }
}
