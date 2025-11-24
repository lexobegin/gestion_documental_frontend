import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Notificacion,
  NotificacionFiltros,
} from '../../../models/notificacion/notificacion.model';
import { NotificacionService } from '../../../services/notificacion/notificacion.service';
//import { ExportService } from '../../../services/exportar/export.service';
import { ExportNotificacionService } from '../../../services/reporte/export-notificacion.service';

@Component({
  selector: 'app-notificacion-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificacion-list.component.html',
  styleUrls: ['./notificacion-list.component.scss'],
})
export class NotificacionListComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  todasNotificaciones: Notificacion[] = []; // Para exportar
  cargando = false;
  generandoReporte = false;
  error?: string;

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalNotificaciones = 0;
  tamanoPagina = 10;

  // Filtros
  terminoBusqueda = '';
  filtroTipo = '';
  filtroLeida = '';

  // Modales
  mostrarModalEliminar = false;
  mostrarModalDetalle = false;
  notificacionSeleccionada?: Notificacion;
  notificacionAEliminar?: Notificacion;

  // Tipos de notificación para el filtro
  tiposNotificacion = [
    { value: '', label: 'Todos los tipos' },
    { value: 'cita', label: 'Cita Médica' },
    { value: 'resultado', label: 'Resultado de Examen' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'sistema', label: 'Sistema' },
    { value: 'receta', label: 'Receta Médica' },
    { value: 'documento', label: 'Nuevo Documento' },
  ];

  // Estados de lectura para el filtro
  estadosLectura = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Leídas' },
    { value: 'false', label: 'No leídas' },
  ];

  constructor(
    private srv: NotificacionService,
    private exportNotificacionSrv: ExportNotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.error = undefined;
    this.paginaActual = pagina;

    const params: any = {
      page: pagina,
      page_size: this.tamanoPagina,
    };

    // Aplicar filtros solo si tienen valor
    if (this.terminoBusqueda) {
      params.search = this.terminoBusqueda;
    }
    if (this.filtroTipo) {
      params.tipo = this.filtroTipo;
    }
    if (this.filtroLeida) {
      params.leida = this.filtroLeida;
    }

    console.log('Cargando notificaciones con parámetros:', params);

    this.srv.listar(params).subscribe({
      next: (respuesta) => {
        this.notificaciones = respuesta.results || [];
        console.log('NOTI: ', this.notificaciones);

        this.totalNotificaciones = respuesta.count || 0;
        this.totalPaginas = Math.ceil(
          this.totalNotificaciones / this.tamanoPagina
        );
        this.cargando = false;

        // Cargar todas las notificaciones para exportar después de cargar la página
        this.cargarTodasNotificaciones();
      },
      error: (e) => {
        console.error('Error al listar notificaciones:', e);
        this.error =
          this.extraerError(e) || 'No se pudo cargar las notificaciones';
        this.cargando = false;
      },
    });
  }

  cargarTodasNotificaciones(): void {
    const filtros: NotificacionFiltros = {};

    // Aplicar los mismos filtros que en la tabla
    if (this.terminoBusqueda) {
      filtros.search = this.terminoBusqueda;
    }
    if (this.filtroTipo) {
      filtros.tipo = this.filtroTipo;
    }
    if (this.filtroLeida) {
      filtros.leida = this.filtroLeida;
    }

    console.log('Cargando todas las notificaciones con filtros:', filtros);

    this.srv.listarTodos(filtros).subscribe({
      next: (notificaciones) => {
        this.todasNotificaciones = notificaciones || [];
        console.log(
          'Notificaciones cargadas para exportar:',
          this.todasNotificaciones.length
        );
      },
      error: (e) => {
        console.error('Error al cargar notificaciones para exportar:', e);
        this.todasNotificaciones = [];
      },
    });
  }

  buscar(): void {
    console.log('Buscando con:', {
      termino: this.terminoBusqueda,
      tipo: this.filtroTipo,
      leida: this.filtroLeida,
    });
    this.paginaActual = 1;
    this.cargar(1);
  }

  aplicarFiltros(): void {
    console.log('Aplicando filtros:', {
      tipo: this.filtroTipo,
      leida: this.filtroLeida,
    });
    this.paginaActual = 1;
    this.cargar(1);
  }

  limpiarFiltros(): void {
    console.log('Limpiando filtros');
    this.terminoBusqueda = '';
    this.filtroTipo = '';
    this.filtroLeida = '';
    this.paginaActual = 1;
    this.cargar(1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.cargar(pagina);
    }
  }

  crear(): void {
    this.router.navigate(['notificacion/crear']);
  }

  editar(id?: number): void {
    if (id == null) return;
    this.router.navigate(['/notificacion/editar', id]);
  }

  verDetalle(notificacion: Notificacion): void {
    this.notificacionSeleccionada = notificacion;
    this.mostrarModalDetalle = true;
  }

  marcarComoLeida(notificacion: Notificacion): void {
    if (!notificacion.id || notificacion.leida) return;

    this.srv.marcarLeida(notificacion.id).subscribe({
      next: () => {
        // Actualizar el estado localmente
        notificacion.leida = true;
        console.log('Notificación marcada como leída:', notificacion.id);
      },
      error: (e) => {
        console.error('Error al marcar notificación como leída:', e);
        this.error = 'No se pudo marcar la notificación como leída';
      },
    });
  }

  marcarTodasLeidas(): void {
    this.srv.marcarTodasLeidas().subscribe({
      next: () => {
        // Actualizar todas las notificaciones localmente
        this.notificaciones.forEach((notif) => (notif.leida = true));
        this.todasNotificaciones.forEach((notif) => (notif.leida = true));
        console.log('Todas las notificaciones marcadas como leídas');
      },
      error: (e) => {
        console.error(
          'Error al marcar todas las notificaciones como leídas:',
          e
        );
        this.error =
          'No se pudieron marcar todas las notificaciones como leídas';
      },
    });
  }

  confirmarEliminar(notificacion: Notificacion): void {
    this.notificacionAEliminar = notificacion;
    this.mostrarModalEliminar = true;
  }

  eliminar(): void {
    if (!this.notificacionAEliminar?.id) return;

    const id = this.notificacionAEliminar.id;
    const backup = this.notificaciones.slice();

    this.notificaciones = this.notificaciones.filter((n) => n.id !== id);
    this.mostrarModalEliminar = false;

    this.srv.eliminar(id).subscribe({
      next: () => {
        this.cargar(this.paginaActual);
      },
      error: (e) => {
        console.error('Error al eliminar notificación:', e);
        this.error =
          this.extraerError(e) || 'No se pudo eliminar la notificación';
        this.notificaciones = backup;
      },
    });
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.notificacionAEliminar = undefined;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.notificacionSeleccionada = undefined;
  }

  /** ==================== REPORTES ==================== */

  generarReportePDF(): void {
    console.log(
      'Generando PDF con',
      this.todasNotificaciones.length,
      'notificaciones'
    );
    this.generarReporte('pdf');
  }

  generarReporteExcel(): void {
    console.log(
      'Generando Excel con',
      this.todasNotificaciones.length,
      'notificaciones'
    );
    this.generarReporte('excel');
  }

  generarReporteHTML(): void {
    console.log(
      'Generando HTML con',
      this.todasNotificaciones.length,
      'notificaciones'
    );
    this.generarReporte('html');
  }

  private generarReporte(formato: 'pdf' | 'excel' | 'html'): void {
    if (this.todasNotificaciones.length === 0) {
      this.error = 'No hay datos para generar el reporte';
      return;
    }

    this.generandoReporte = true;
    this.error = undefined;

    try {
      const datosExportar =
        this.exportNotificacionSrv.prepararDatosNotificaciones(
          this.todasNotificaciones
        );
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `reporte_notificaciones_${fecha}`;
      const title = `Reporte de Notificaciones - ${new Date().toLocaleDateString(
        'es-ES'
      )}`;

      switch (formato) {
        case 'pdf':
          this.exportNotificacionSrv.exportToPDF(
            datosExportar,
            filename,
            title
          );
          break;
        case 'excel':
          this.exportNotificacionSrv.exportToExcel(datosExportar, filename);
          break;
        case 'html':
          this.exportNotificacionSrv.exportToHTML(
            datosExportar,
            filename,
            title
          );
          break;
      }

      console.log(`Reporte ${formato} generado exitosamente`);
    } catch (error) {
      console.error(`Error al generar reporte ${formato}:`, error);
      this.error = `Error al generar el reporte ${formato.toUpperCase()}`;
    } finally {
      this.generandoReporte = false;
    }
  }

  /** ==================== HELPERS ==================== */

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

  getTipoBadgeClass(tipo: string): string {
    const map: { [key: string]: string } = {
      cita: 'bg-primary',
      resultado: 'bg-info',
      seguimiento: 'bg-warning',
      sistema: 'bg-secondary',
      receta: 'bg-success',
      documento: 'bg-dark',
    };
    return map[tipo] || 'bg-secondary';
  }

  trackById(_i: number, n: Notificacion): number | undefined {
    return n.id;
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

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatearMensajeCorto(mensaje: string): string {
    if (!mensaje) return '—';
    return mensaje.length > 50 ? mensaje.substring(0, 50) + '...' : mensaje;
  }
}
