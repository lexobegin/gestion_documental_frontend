import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

interface NotificacionCreateVM {
  usuario: number | null;
  tipo:
    | 'cita'
    | 'resultado'
    | 'seguimiento'
    | 'sistema'
    | 'receta'
    | 'documento'
    | '';
  titulo: string;
  mensaje: string;
  leida: boolean;
  datos_adicionales: string;
}

@Component({
  selector: 'app-notificacion-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notificacion-create.component.html',
  styleUrl: './notificacion-create.component.scss',
})
export class NotificacionCreateComponent implements OnInit {
  notificacion: NotificacionCreateVM = {
    usuario: null,
    tipo: '',
    titulo: '',
    mensaje: '',
    leida: false,
    datos_adicionales: '',
  };

  usuarios: UsuarioSelect[] = [];
  guardando = false;
  error?: string;
  mensaje?: string;
  submitted = false;

  // Tipos de notificación
  tiposNotificacion = [
    { value: '', label: '-- Selecciona un tipo --' },
    { value: 'cita', label: 'Cita Médica' },
    { value: 'resultado', label: 'Resultado de Examen' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'sistema', label: 'Sistema' },
    { value: 'receta', label: 'Receta Médica' },
    { value: 'documento', label: 'Nuevo Documento' },
  ];

  constructor(
    private srv: NotificacionService,
    private usuarioSrv: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.error = undefined;
    // Usamos el endpoint de select/pacientes que mencionaste
    this.usuarioSrv.listarTodos().subscribe({
      next: (usuarios) => {
        // Adaptar la respuesta según la estructura que recibas
        this.usuarios = this.adaptarUsuariosParaSelect(usuarios);
        console.log('Usuarios cargados:', this.usuarios);
      },
      error: (e) => {
        console.error('Error cargando usuarios:', e);
        this.error = 'No se pudieron cargar los usuarios. Intente nuevamente.';
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

    // Validación de usuario
    if (!this.notificacion.usuario) {
      this.error = 'Debe seleccionar un usuario para la notificación.';
      this.scrollToError();
      return;
    }

    // Validación de tipo
    if (!this.notificacion.tipo) {
      this.error = 'Debe seleccionar un tipo de notificación.';
      this.scrollToError();
      return;
    }

    // Validación de título
    if (!this.notificacion.titulo.trim()) {
      this.error = 'El título es requerido.';
      this.scrollToError();
      return;
    }

    // Validación de mensaje
    if (!this.notificacion.mensaje.trim()) {
      this.error = 'El mensaje es requerido.';
      this.scrollToError();
      return;
    }

    const dto = this.buildDto(this.notificacion);

    this.guardando = true;
    this.srv.crear(dto).subscribe({
      next: (notificacionCreada) => {
        this.guardando = false;
        this.mensaje = `Notificación "${notificacionCreada.titulo}" creada exitosamente.`;

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/notificacion']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al crear notificación:', err);
        this.error =
          this.extractBackendError(err) ||
          'No se pudo crear la notificación. Por favor, intente nuevamente.';
        this.guardando = false;
        this.scrollToError();
      },
    });
  }

  /** Normaliza y limpia el payload para el backend */
  private buildDto(n: NotificacionCreateVM): any {
    const dto: any = {
      usuario: Number(n.usuario),
      tipo: n.tipo,
      titulo: n.titulo?.trim(),
      mensaje: n.mensaje?.trim(),
      leida: !!n.leida,
    };

    // Procesar datos adicionales si se proporcionan
    if (n.datos_adicionales?.trim()) {
      try {
        dto.datos_adicionales = JSON.parse(n.datos_adicionales);
      } catch (e) {
        // Si no es JSON válido, guardar como string
        dto.datos_adicionales = { custom_data: n.datos_adicionales.trim() };
      }
    }

    // Elimina campos vacíos/undefined
    Object.keys(dto).forEach((k) => {
      const v = dto[k];
      if (v === undefined || v === '' || v === null) delete dto[k];
    });

    console.log('DTO a enviar:', dto);
    return dto;
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
        usuario: 'Usuario',
        tipo: 'Tipo',
        titulo: 'Título',
        mensaje: 'Mensaje',
        leida: 'Estado de lectura',
        datos_adicionales: 'Datos adicionales',
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

  // Helper para obtener el nombre completo del usuario seleccionado
  getUsuarioSeleccionadoNombre(): string {
    if (!this.notificacion.usuario) return '';
    const usuario = this.usuarios.find(
      (u) => u.usuario.id === this.notificacion.usuario
    );
    return usuario ? usuario.nombre_completo : '';
  }

  // Helper para verificar si el formulario es válido
  get formValid(): boolean {
    return (
      !this.guardando &&
      this.notificacion.usuario !== null &&
      this.notificacion.tipo !== '' &&
      this.notificacion.titulo.trim().length >= 2 &&
      this.notificacion.mensaje.trim().length >= 5
    );
  }

  // Helper para contar caracteres del mensaje
  get contadorCaracteres(): number {
    return this.notificacion.mensaje.length;
  }

  // Helper para validar JSON en datos adicionales
  get datosAdicionalesValidos(): boolean {
    if (!this.notificacion.datos_adicionales.trim()) return true;

    try {
      JSON.parse(this.notificacion.datos_adicionales);
      return true;
    } catch {
      return false;
    }
  }
}
