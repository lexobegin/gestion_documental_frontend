import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Usuario } from '../../../models/usuario/usuario.model';
import { UsuarioService } from '../../../services/usuario/usuario.service';

@Component({
  selector: 'app-usuario-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuario-update.component.html',
  styleUrls: ['./usuario-update.component.scss'],
})
export class UsuarioUpdateComponent implements OnInit {
  usuario: Usuario = { nombre: '', apellido: '', email: '', telefono: '', activo: true };
  id!: number;
  cargando = true;
  guardando = false;
  error?: string;
  mensaje?: string;

  constructor(
    private route: ActivatedRoute,
    private srv: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.id = Number(rawId);
    if (!rawId || Number.isNaN(this.id)) {
      this.router.navigate(['/usuarios']);
      return;
    }

    this.cargar();
  }

  private cargar(): void {
    this.cargando = true;
    this.error = undefined;
    this.srv.obtener(this.id).subscribe({
      next: (u) => {
        this.usuario = u;
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al obtener usuario:', e);
        this.error = this.extraerError(e) || 'No se pudo cargar';
        this.cargando = false;
      },
    });
  }

  guardar(f: NgForm): void {
    if (this.guardando) return;
    this.error = undefined;
    this.mensaje = undefined;

    if (f.invalid) return;

    // Construye DTO solo con campos editables (evita enviar id u otros no necesarios)
    const dto: any = {
      nombre: this.usuario.nombre?.trim(),
      apellido: this.usuario.apellido?.trim(),
      email: this.usuario.email?.trim()?.toLowerCase(),
      telefono: this.usuario.telefono?.trim() || null,
      activo: !!this.usuario.activo,
    };
    // Si tu modelo incluye id_rol y lo editas en el HTML, descomenta:
    // if (this.usuario.hasOwnProperty('id_rol')) dto.id_rol = Number((this.usuario as any).id_rol) || null;

    // Limpia claves vacías
    Object.keys(dto).forEach((k) => {
      const v = dto[k];
      if (v === undefined || v === '') delete dto[k];
    });

    this.guardando = true;
    this.srv.actualizarParcial(this.id, dto).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = 'Usuario actualizado';
        setTimeout(() => this.router.navigate(['/usuarios']), 600);
      },
      error: (e) => {
        console.error('Error al actualizar usuario:', e);
        this.error = this.extraerError(e) || 'No se pudo actualizar';
        this.guardando = false;
      },
    });
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
