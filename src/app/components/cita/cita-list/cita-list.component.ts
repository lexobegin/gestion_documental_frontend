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
  cambiarEstado(cita: Cita, nuevoEstado: string): void {
    this.citaService.cambiarEstadoCita(cita.id, nuevoEstado).subscribe({
      next: (citaActualizada) => {
        // Actualizar la cita en la lista
        const index = this.citas.findIndex((c) => c.id === cita.id);
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

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5); // Formato HH:MM
  }

  formatearFechaHora(fechaHora: string): string {
    return new Date(fechaHora).toLocaleString('es-ES');
  }
  irACalendario(): void {
    this.router.navigate(['/citas/calendario']);
  }
}
