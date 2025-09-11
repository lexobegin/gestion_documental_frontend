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
