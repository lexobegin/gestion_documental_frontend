import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/usuario/usuario.model';
import { UsuarioService } from '../../../services/usuario/usuario.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.scss'],
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando = false;
  error?: string;

  constructor(
    private srv: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = undefined;

    this.srv.listar().subscribe({
      next: (d) => {
        // Soporta array directo o respuesta paginada (DRF)
        this.usuarios = Array.isArray(d)
          ? d
          : (d?.results ?? d?.items ?? []);
        this.cargando = false;
        // console.debug('listar() payload:', d, '=> usuarios:', this.usuarios);
      },
      error: (e) => {
        console.error('Error al listar usuarios:', e);
        this.error = this.extraerError(e) || 'No se pudo cargar usuarios';
        this.cargando = false;
      },
    });
  }

  crear(): void {
    this.router.navigate(['/usuarios/crear']);
  }

  editar(id?: number): void {
    if (id == null) return;
    this.router.navigate(['/usuarios/editar', id]);
  }

  eliminar(id?: number): void {
    if (id == null) return;
    if (!confirm('¿Eliminar este usuario?')) return;

    // Eliminación optimista
    const backup = this.usuarios.slice();
    this.usuarios = this.usuarios.filter(u => u.id !== id);

    this.srv.eliminar(id).subscribe({
      next: () => {
        // ok
      },
      error: (e) => {
        console.error('Error al eliminar usuario:', e);
        this.error = this.extraerError(e) || 'No se pudo eliminar el usuario';
        // revertir
        this.usuarios = backup;
      },
    });
  }

  trackById(_i: number, u: Usuario): number | undefined {
    return u.id;
  }

  /** ===================== Helpers de Rol (mejorados) ===================== */

  /** Normaliza cualquier valor de rol (string | number | object | array) a string en minúsculas */
  private normalizeRoleValue(v: any): string {
    if (!v) return '';

    if (typeof v === 'string') return v.toLowerCase().trim();

    if (typeof v === 'number') {
      const mapNum: Record<number, string> = { 1: 'admin', 2: 'medico', 3: 'paciente' };
      return mapNum[v] || '';
    }

    if (Array.isArray(v) && v.length > 0) {
      return this.normalizeRoleValue(v[0]);
    }

    if (typeof v === 'object') {
      // intenta campos comunes de objetos de rol
      const candidates = [
        v.name, v.nombre, v.label, v.value, v.slug, v.key,
        v.role, v.rol, v.tipo, v.code, v.descripcion, v.description
      ];
      for (const c of candidates) {
        const n = this.normalizeRoleValue(c);
        if (n) return n;
      }
      // si solo hay id, intenta mapear
      if (typeof v.id === 'number') return this.normalizeRoleValue(v.id);
    }

    return '';
  }

  /** Devuelve el rol normalizado: 'admin' | 'medico' | 'paciente' | otro */
  getRole(u: any): string {
    // 1) Campos directos
    let r =
      this.normalizeRoleValue(u?.rol)  ||
      this.normalizeRoleValue(u?.role) ||
      this.normalizeRoleValue(u?.tipo);

    // 2) Perfil anidado
    if (!r) r = this.normalizeRoleValue(u?.profile?.role);

    // 3) Grupos (Django Groups)
    if (!r) r = this.normalizeRoleValue(u?.groups);

    // 4) Flags
    if (!r && (u?.is_superuser || u?.is_staff)) r = 'admin';

    // 5) Código numérico directo
    if (!r && typeof u?.role_id !== 'undefined') r = this.normalizeRoleValue(u.role_id);

    // 6) Default
    return r || 'paciente';
  }

  /** Etiqueta amigable para el badge */
  labelRole(role: string | null | undefined): string {
    switch ((role || '').toLowerCase()) {
      case 'admin':    return 'Admin';
      case 'médico':
      case 'medico':   return 'Médico';
      case 'paciente': return 'Paciente';
      default:         return role ? role : 'Paciente';
    }
  }

  /** ===================================================================== */

  private extraerError(err: any): string {
    const e = err?.error;
    if (!e) return '';
    if (typeof e === 'string') return e;
    if (e.detail) return e.detail;
    if (typeof e === 'object') {
      const msgs: string[] = [];
      for (const k of Object.keys(e)) {
        const v = e[k];
        if (Array.isArray(v)) msgs.push(`${k}: ${v.join(', ')}`);
        else if (typeof v === 'string') msgs.push(`${k}: ${v}`);
      }
      return msgs.join(' | ');
    }
    return '';
  }
}
