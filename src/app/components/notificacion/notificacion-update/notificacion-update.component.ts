import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Notificacion } from '../../../models/notificacion/notificacion.model';
import { NotificacionService } from '../../../services/notificacion/notificacion.service';
import { UsuarioService } from '../../../services/usuario/usuario.service';

interface UsuarioSelect {
  usuario: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    nombre_completo: string;
  };
  nombre_completo: string;
  email: string;
  estado: string;
  tipo_sangre?: string;
}

@Component({
  selector: 'app-notificacion-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notificacion-update.component.html',
  styleUrl: './notificacion-update.component.scss',
})
export class NotificacionUpdateComponent implements OnInit {
  notificacion: Notificacion = {
    usuario: 0,
    tipo: 'sistema',
    titulo: '',
    mensaje: '',
    leida: false,
    fecha_envio: '',
  };

  usuarios: UsuarioSelect[] = [];
  id!: number;
  cargando = true;
  guardando = false;
  error?: string;
  mensaje?: string;

  // Tipos de notificación
  tiposNotificacion = [
    { value: 'cita', label: 'Cita Médica' },
    { value: 'resultado', label: 'Resultado de Examen' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'sistema', label: 'Sistema' },
    { value: 'receta', label: 'Receta Médica' },
    { value: 'documento', label: 'Nuevo Documento' },
  ];

  // Para mostrar datos adicionales en formato editable
  datosAdicionalesTexto: string = '';

  constructor(
    private route: ActivatedRoute,
    private srv: NotificacionService,
    private usuarioSrv: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.id = Number(rawId);
    if (!rawId || Number.isNaN(this.id)) {
      this.router.navigate(['/notificaciones']);
      return;
    }

    this.cargarUsuarios();
    this.cargar();
  }

  private cargar(): void {
    this.cargando = true;
    this.error = undefined;
    this.srv.obtener(this.id).subscribe({
      next: (notif) => {
        this.notificacion = notif;
        // Convertir datos_adicionales a string para el textarea
        if (notif.datos_adicionales) {
          this.datosAdicionalesTexto = JSON.stringify(
            notif.datos_adicionales,
            null,
            2
          );
        }
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al obtener notificación:', e);
        this.error =
          this.extraerError(e) || 'No se pudo cargar la notificación';
        this.cargando = false;
      },
    });
  }

  cargarUsuarios(): void {
    this.usuarioSrv.listarTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = this.adaptarUsuariosParaSelect(usuarios);
        console.log('Usuarios cargados:', this.usuarios);
      },
      error: (e) => {
        console.error('Error cargando usuarios:', e);
        // No mostramos error para no interrumpir la carga de la notificación
      },
    });
  }

  private adaptarUsuariosParaSelect(usuarios: any[]): UsuarioSelect[] {
    // Si ya viene en el formato correcto del endpoint /api/select/pacientes/
    if (usuarios.length > 0 && usuarios[0].usuario) {
      return usuarios;
    }

    // Si viene en formato diferente, adaptarlo
    return usuarios.map((user) => ({
      usuario: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        nombre_completo: `${user.nombre} ${user.apellido}`.trim(),
      },
      nombre_completo: `${user.nombre} ${user.apellido}`.trim(),
      email: user.email,
      estado: user.activo ? 'Activo' : 'Inactivo',
      tipo_sangre: user.tipo_sangre || 'No especificado',
    }));
  }

  guardar(f: NgForm): void {
    if (this.guardando) return;
    this.error = undefined;
    this.mensaje = undefined;

    if (f.invalid) {
      this.error =
        'Por favor, complete todos los campos requeridos correctamente.';
      return;
    }

    // Validaciones adicionales
    if (!this.notificacion.titulo.trim()) {
      this.error = 'El título es requerido.';
      return;
    }

    if (!this.notificacion.mensaje.trim()) {
      this.error = 'El mensaje es requerido.';
      return;
    }

    // Construye DTO con campos editables
    const dto: any = {
      usuario: Number(this.notificacion.usuario),
      tipo: this.notificacion.tipo,
      titulo: this.notificacion.titulo?.trim(),
      mensaje: this.notificacion.mensaje?.trim(),
      leida: !!this.notificacion.leida,
    };

    // Procesar datos adicionales
    if (this.datosAdicionalesTexto?.trim()) {
      try {
        dto.datos_adicionales = JSON.parse(this.datosAdicionalesTexto);
      } catch (e) {
        this.error =
          'El formato de datos adicionales no es válido. Debe ser JSON válido.';
        return;
      }
    } else {
      dto.datos_adicionales = null;
    }

    // Limpia claves vacías
    Object.keys(dto).forEach((k) => {
      const v = dto[k];
      if (v === undefined || v === '') delete dto[k];
    });

    console.log('DTO a enviar:', dto);

    this.guardando = true;
    this.srv.actualizarParcial(this.id, dto).subscribe({
      next: (notificacionActualizada) => {
        this.guardando = false;
        this.mensaje = 'Notificación actualizada exitosamente.';

        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/notificaciones']);
        }, 1500);
      },
      error: (e) => {
        console.error('Error al actualizar notificación:', e);
        this.error =
          this.extraerError(e) || 'No se pudo actualizar la notificación';
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

  // Helper para obtener el nombre del tipo de notificación
  getTipoLabel(tipo: string): string {
    const map: { [key: string]: string } = {
      cita: 'Cita Médica',
      resultado: 'Resultado de Examen',
      seguimiento: 'Seguimiento',
      sistema: 'Sistema',
      receta: 'Receta Médica',
      documento: 'Nuevo Documento',
    };
    return map[tipo] || tipo;
  }

  // Helper para contar caracteres del mensaje
  get contadorCaracteres(): number {
    return this.notificacion.mensaje.length;
  }

  // Helper para validar JSON en datos adicionales
  get datosAdicionalesValidos(): boolean {
    if (!this.datosAdicionalesTexto.trim()) return true;

    try {
      JSON.parse(this.datosAdicionalesTexto);
      return true;
    } catch {
      return false;
    }
  }

  // Helper para formatear fecha
  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-ES');
  }

  // Helper para obtener nombre del usuario seleccionado
  getUsuarioNombre(usuarioId: number): string {
    const usuario = this.usuarios.find((u) => u.usuario.id === usuarioId);
    return usuario ? usuario.nombre_completo : `ID: ${usuarioId}`;
  }
}
