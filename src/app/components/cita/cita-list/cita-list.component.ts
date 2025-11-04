import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cita, ApiResponse } from '../../../models/cita/cita.model';
import { CitaService } from '../../../services/cita/cita.service';
import { ExportCitaService } from '../../../services/reporte/export-cita.service';

@Component({
  selector: 'app-cita-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cita-list.component.html',
  styleUrl: './cita-list.component.scss',
})
export class CitaListComponent implements OnInit {
  // Datos y estado
  citas: Cita[] = [];
  citaSeleccionada: Cita | null = null;
  citaAEliminar: Cita | null = null;

  // Estado de UI
  cargando: boolean = false;
  error: string | undefined;
  mostrarModalDetalle: boolean = false;
  mostrarModalEliminar: boolean = false;

  // Búsqueda y filtros
  terminoBusqueda: string = '';
  filtroEstado: string = '';
  filtroFecha: string = '';

  // Paginación
  paginaActual: number = 1;
  totalCitas: number = 0;
  totalPaginas: number = 0;
  limitePorPagina: number = 10;

  // Agregar estas propiedades en la clase
  todasCitas: Cita[] = []; // Para exportar
  generandoReporte: boolean = false;

  constructor(
    private citaService: CitaService,
    private exportCitaService: ExportCitaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarTodasCitas(); // Para exportación
  }

  // Carga de datos
  cargarCitas(pagina: number = 1): void {
    this.cargando = true;
    this.error = undefined;

    const params: any = {
      page: pagina,
      ordering: '-fecha_cita,-hora_cita',
    };

    if (this.terminoBusqueda) {
      params.search = this.terminoBusqueda;
    }

    if (this.filtroEstado) {
      params.estado = this.filtroEstado;
    }

    if (this.filtroFecha) {
      console.log('filtrofecha: ', this.filtroFecha);
      params.fecha_cita = this.filtroFecha;
    }

    /*if (this.filtroFecha) {
      // Suponiendo que this.filtroFecha tiene formato 'dd-mm-aaaa'
      console.log('filtrofecha: ', this.filtroFecha);

      const partes = this.filtroFecha.split('-');
      if (partes.length === 3) {
        const fechaConvertida = `${partes[2]}-${partes[1]}-${partes[0]}`;
        console.log('FECHA: ', fechaConvertida);

        params.fecha_cita = fechaConvertida;
      }
    }*/

    this.citaService.getCitas(params).subscribe({
      next: (response: ApiResponse<Cita>) => {
        this.citas = response.results;
        console.log('CITAS: ', this.citas);

        this.totalCitas = response.count;
        this.totalPaginas = Math.ceil(response.count / this.limitePorPagina);
        this.paginaActual = pagina;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las citas';
        this.cargando = false;
        console.error('Error loading citas:', err);
      },
    });
  }

  // Método para cargar todas las citas (sin paginación)
  cargarTodasCitas(): void {
    const params = {
      ordering: '-fecha_cita,-hora_cita',
      ...(this.terminoBusqueda && { search: this.terminoBusqueda }),
      ...(this.filtroEstado && { estado: this.filtroEstado }),
      ...(this.filtroFecha && { fecha_cita: this.filtroFecha }),
    };

    this.citaService.getCitas(params).subscribe({
      next: (response: ApiResponse<Cita>) => {
        this.todasCitas = response.results;
      },
      error: (err) => {
        console.error('Error loading all citas:', err);
      },
    });
  }

  // Métodos de exportación
  generarReportePDF(): void {
    this.generarReporte('pdf');
  }

  generarReporteExcel(): void {
    this.generarReporte('excel');
  }

  generarReporteHTML(): void {
    this.generarReporte('html');
  }

  private generarReporte(formato: 'pdf' | 'excel' | 'html'): void {
    if (this.todasCitas.length === 0) {
      this.error = 'No hay datos para generar el reporte';
      return;
    }

    this.generandoReporte = true;
    this.error = undefined;

    try {
      const datosExportar = this.exportCitaService.prepararDatosCitas(
        this.todasCitas
      );
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `reporte_citas_${fecha}`;
      const title = `Reporte de Citas - ${new Date().toLocaleDateString(
        'es-ES'
      )}`;

      switch (formato) {
        case 'pdf':
          this.exportCitaService.exportToPDFAsCards(
            datosExportar,
            filename,
            title
          );
          break;
        case 'excel':
          this.exportCitaService.exportToExcel(datosExportar, filename);
          break;
        case 'html':
          this.exportCitaService.exportToHTML(datosExportar, filename, title);
          break;
      }
    } catch (error) {
      console.error(`Error al generar reporte ${formato}:`, error);
      this.error = `Error al generar el reporte ${formato.toUpperCase()}`;
    } finally {
      this.generandoReporte = false;
    }
  }

  // Búsqueda y filtros
  buscar(): void {
    this.paginaActual = 1;
    this.cargarCitas(1);
    this.cargarTodasCitas();
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarCitas(1);
    this.cargarTodasCitas();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroEstado = '';
    this.filtroFecha = '';
    this.paginaActual = 1;
    this.cargarCitas(1);
    this.cargarTodasCitas();
  }

  // Paginación
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.cargarCitas(pagina);
    }
  }

  // Navegación
  crear(): void {
    this.router.navigate(['/citas/crear']);
  }

  editar(id: number): void {
    this.router.navigate(['/citas/editar', id]);
  }

  // Modales de detalle
  verDetalle(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.citaSeleccionada = null;
  }

  // Cambio de estado
  cambiarEstadoo(cita: Cita, nuevoEstado: string): void {
    this.citaService.cambiarEstadoCita(cita.id, nuevoEstado).subscribe({
      next: (citaActualizada) => {
        // Actualizar la cita en la lista
        console.log('cita.id: ', cita.id);
        console.log('citas: ', this.citas);

        const index = this.citas.findIndex((c) => c.id === cita.id);
        console.log('index: ', index);
        console.log('citaAct: ', citaActualizada);

        if (index !== -1) {
          this.citas[index] = citaActualizada;
        }
      },
      error: (err) => {
        this.error = 'Error al cambiar el estado de la cita';
        console.error('Error changing cita state:', err);
      },
    });
  }

  cambiarEstado(cita: Cita, nuevoEstado: string): void {
    this.citaService.cambiarEstadoCita(cita.id, nuevoEstado).subscribe({
      next: (response: any) => {
        // El backend retorna { detail: string, cita: Cita }
        const citaActualizada = response.cita;

        //console.log('Cita actualizada:', citaActualizada); // Verificar la estructura

        // Actualizar la cita en la lista
        const index = this.citas.findIndex((c) => c.id === cita.id);
        if (index !== -1) {
          this.citas[index] = citaActualizada;
          // Mensaje de éxito
          this.mostrarMensajeTemporal(
            `Estado cambiado a "${this.getEstadoTexto(nuevoEstado)}"`
          );
        }
      },
      error: (err) => {
        this.error = 'Error al cambiar el estado de la cita';
        console.error('Error changing cita state:', err);
      },
    });
  }

  // Método para mostrar mensaje temporal
  mostrarMensajeTemporal(mensaje: string): void {
    // Crear un toast temporal
    const toast = document.createElement('div');
    toast.className =
      'alert alert-success alert-dismissible fade show position-fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.minWidth = '300px';
    toast.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

    document.body.appendChild(toast);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  // Eliminación
  confirmarEliminar(cita: Cita): void {
    this.citaAEliminar = cita;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.citaAEliminar = null;
  }

  eliminar(): void {
    if (!this.citaAEliminar) return;

    this.citaService.deleteCita(this.citaAEliminar.id).subscribe({
      next: () => {
        this.mostrarModalEliminar = false;
        this.citaAEliminar = null;
        this.cargarCitas(this.paginaActual);
      },
      error: (err) => {
        this.error = 'Error al eliminar la cita';
        this.mostrarModalEliminar = false;
        console.error('Error deleting cita:', err);
      },
    });
  }

  // Utilidades
  trackById(index: number, item: Cita): number {
    return item.id;
  }

  getBadgeClass(estado: string): string {
    const classes: { [key: string]: string } = {
      pendiente: 'bg-warning',
      confirmada: 'bg-success',
      cancelada: 'bg-danger',
      realizada: 'bg-info',
    };
    return classes[estado] || 'bg-secondary';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      realizada: 'Realizada',
    };
    return textos[estado] || estado;
  }

  formatearFecha1(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearHora1(hora: string): string {
    return hora.substring(0, 5); // Formato HH:MM
  }

  formatearFechaHora1(fechaHora: string): string {
    return new Date(fechaHora).toLocaleString('es-ES');
  }

  formatearFecha2(fecha: string | null | undefined): string {
    if (!fecha) {
      return '--/--/----';
    }
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) {
      return '--/--/----';
    }
    try {
      // Dividir el string en partes
      const [year, month, day] = fecha.split('-').map(Number);
      // Crear una fecha local sin conversión UTC
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  formatearHora(hora: string | null | undefined): string {
    if (!hora) {
      return '--:--';
    }
    try {
      return hora.substring(0, 5);
    } catch (error) {
      return 'Hora inválida';
    }
  }

  formatearFechaHora(fechaHora: string | null | undefined): string {
    if (!fechaHora) {
      return 'Fecha no disponible';
    }
    try {
      return new Date(fechaHora).toLocaleString('es-ES');
    } catch (error) {
      return 'Fecha/hora inválida';
    }
  }

  irACalendario(): void {
    this.router.navigate(['/citas/calendario']);
  }
}
