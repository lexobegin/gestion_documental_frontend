import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Bitacora,
  BitacoraFilters,
} from '../../../models/bitacora/bitacora.model';
import { BitacoraService } from '../../../services/bitacora/bitacora.service';
import { BitacoraFilterComponent } from '../bitacora-filter/bitacora-filter.component';
import { ExportService } from '../../../services/exportar/export.service'; // ✅ AGREGAR

@Component({
  selector: 'app-bitacora-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BitacoraFilterComponent],
  templateUrl: './bitacora-list.component.html',
})
export class BitacoraListComponent implements OnInit {
  bitacora: Bitacora[] = [];
  todosRegistros: Bitacora[] = []; // PARA EXPORTAR
  cargando = false;
  generandoReporte = false; // NUEVO
  error: string | undefined;

  // Filtros
  filtros: BitacoraFilters = {};
  terminoBusqueda = '';

  // ACTUALIZADO: Paginación del servidor
  paginaActual = 1;
  totalPaginas = 0; // CAMBIADO: propiedad directa
  totalRegistros = 0;
  itemsPorPagina = 10;

  // NUEVO: Para modal de detalles
  mostrarModalDetalle = false;
  registroSeleccionado: any = null;

  constructor(
    private bitacoraService: BitacoraService,
    private exportService: ExportService // AGREGAR
  ) {}

  ngOnInit(): void {
    this.cargarBitacora();
  }

  // ACTUALIZADO: Paginación del servidor
  cargarBitacora(pagina: number = 1): void {
    this.cargando = true;
    this.error = undefined;

    this.bitacoraService.listar(this.filtros, pagina).subscribe({
      next: (response: any) => {
        // Manejar respuesta paginada del servidor
        if (response && response.results) {
          this.bitacora = response.results;
          this.totalRegistros = response.count;
          this.totalPaginas = Math.ceil(response.count / this.itemsPorPagina);
          this.paginaActual = pagina;
        } else {
          // Fallback si no hay paginación
          this.bitacora = Array.isArray(response) ? response : [response];
          this.totalRegistros = this.bitacora.length;
          this.totalPaginas = 1;
        }
        this.cargando = false;

        // Cargar todos los registros para exportar
        this.cargarTodosRegistros();
      },
      error: (error: any) => {
        this.error = 'Error al cargar la bitácora';
        this.cargando = false;
        console.error('Error:', error);
      },
    });
  }

  // NUEVO: Cargar todos los registros para exportar
  cargarTodosRegistros(): void {
    this.bitacoraService.listarTodos(this.filtros).subscribe({
      next: (registros: Bitacora[]) => {
        this.todosRegistros = registros || [];
      },
      error: (error: any) => {
        console.error('Error al cargar registros para exportar:', error);
        this.todosRegistros = [];
      },
    });
  }

  buscar(): void {
    if (this.terminoBusqueda.trim()) {
      this.filtros.search = this.terminoBusqueda.trim();
    } else {
      delete this.filtros.search;
    }
    this.paginaActual = 1;
    this.cargarBitacora(1);
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.cargarBitacora(1);
  }

  aplicarFiltros(nuevosFiltros: BitacoraFilters): void {
    this.filtros = { ...this.filtros, ...nuevosFiltros };
    this.paginaActual = 1;
    this.cargarBitacora(1);
  }

  // ACTUALIZADO: Paginación del servidor
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.cargarBitacora(pagina);
    }
  }

  // NUEVO: Métodos de exportación
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
    if (this.todosRegistros.length === 0) {
      this.error = 'No hay datos para generar el reporte';
      return;
    }

    this.generandoReporte = true;
    this.error = undefined;

    try {
      const datosExportar = this.exportService.prepararDatosBitacora(
        this.todosRegistros
      );
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `reporte_bitacora_${fecha}`;
      const title = `Reporte de Bitácora - ${new Date().toLocaleDateString(
        'es-ES'
      )}`;

      switch (formato) {
        case 'pdf':
          this.exportService.exportToPDF(datosExportar, filename, title);
          break;
        case 'excel':
          this.exportService.exportToExcel(datosExportar, filename);
          break;
        case 'html':
          this.exportService.exportToHTML(datosExportar, filename, title);
          break;
      }
    } catch (error) {
      console.error(`Error al generar reporte ${formato}:`, error);
      this.error = `Error al generar el reporte ${formato.toUpperCase()}`;
    } finally {
      this.generandoReporte = false;
    }
  }

  // NUEVO: Métodos para ver detalles
  verDetalle(registro: Bitacora): void {
    this.bitacoraService.getDetalleCompleto(registro.id).subscribe({
      next: (detalle: any) => {
        this.registroSeleccionado = detalle;
        this.mostrarModalDetalle = true;
      },
      error: (error: any) => {
        console.error('Error al cargar detalle:', error);
        this.error = 'Error al cargar los detalles del registro';
      },
    });
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.registroSeleccionado = null;
  }

  // ELIMINADO: Los getters bitacoraPaginada y paginasTotales
  // Ya no se necesitan porque usamos paginación del servidor

  trackById(index: number, item: Bitacora): number {
    return item.id;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

  getModuloClass(modulo: string): string {
    const clases: { [key: string]: string } = {
      usuarios: 'bg-primary',
      citas: 'bg-success',
      historias_clinicas: 'bg-info',
      consultas: 'bg-warning',
      backups: 'bg-danger',
      roles: 'bg-secondary',
      permisos: 'bg-dark',
      autenticacion: 'bg-success',
    };
    return clases[modulo] || 'bg-light text-dark';
  }
}
