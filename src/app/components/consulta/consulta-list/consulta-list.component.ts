import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Consulta } from '../../../models/consulta/consulta.model';
import { ConsultaService } from '../../../services/consulta/consulta.service';
import { ExportService } from '../../../services/exportar/export.service';

@Component({
  selector: 'app-consulta-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-list.component.html',
  styleUrls: ['./consulta-list.component.scss']
})
export class ConsultaListComponent implements OnInit {
  consultas: Consulta[] = [];
  todasConsultas: Consulta[] = []; // para exportación
  cargando = false;
  generandoReporte = false;
  error?: string;

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalConsultas = 0;
  tamanoPagina = 10;

  // Búsqueda
  terminoBusqueda = '';

  // Modales
  mostrarModalEliminar = false;
  mostrarModalDetalle = false;
  consultaSeleccionada?: Consulta;
  consultaAEliminar?: Consulta;

  constructor(
    private srv: ConsultaService,
    private exportSrv: ExportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.error = undefined;
    this.paginaActual = pagina;

    const filtros: any = { page: pagina, page_size: this.tamanoPagina };
    if (this.terminoBusqueda) filtros.search = this.terminoBusqueda;

    this.srv.getConsultas(filtros).subscribe({
      next: (respuesta) => {
        this.consultas = respuesta.results || [];
        this.totalConsultas = respuesta.count || 0;
        this.totalPaginas = Math.ceil(this.totalConsultas / this.tamanoPagina);
        this.cargando = false;
        this.cargarTodasConsultas();
      },
      error: (e) => {
        console.error('Error al listar consultas:', e);
        this.error = this.extraerError(e) || 'No se pudo cargar las consultas';
        this.cargando = false;
      }
    });
  }

  cargarTodasConsultas(): void {
    this.srv.getConsultas().subscribe({
      next: (res) => (this.todasConsultas = res.results || []),
      error: () => (this.todasConsultas = [])
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargar(1);
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.cargar(1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.cargar(pagina);
    }
  }

  crear(): void {
    this.router.navigate(['/consulta-create']);
  }

  editar(id?: number): void {
    if (!id) return;
    this.router.navigate(['/consulta-update', id]);
  }

  verDetalle(consulta: Consulta): void {
    this.consultaSeleccionada = consulta;
    this.mostrarModalDetalle = true;
  }

  confirmarEliminar(consulta: Consulta): void {
    this.consultaAEliminar = consulta;
    this.mostrarModalEliminar = true;
  }

  eliminar(): void {
    if (!this.consultaAEliminar?.id) return;
    const id = this.consultaAEliminar.id;
    const copia = [...this.consultas];

    this.consultas = this.consultas.filter((c) => c.id !== id);
    this.mostrarModalEliminar = false;

    this.srv.deleteConsulta(id).subscribe({
      next: () => this.cargar(this.paginaActual),
      error: (e) => {
        console.error('Error al eliminar consulta:', e);
        this.error = this.extraerError(e) || 'No se pudo eliminar la consulta';
        this.consultas = copia;
      }
    });
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.consultaAEliminar = undefined;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.consultaSeleccionada = undefined;
  }

  // ==================== REPORTES ====================

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
    if (!this.todasConsultas.length) {
      this.error = 'No hay datos para generar reporte.';
      return;
    }

    this.generandoReporte = true;

    try {
      const datosExportar = this.exportSrv.prepararDatosConsultas(this.todasConsultas);
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `reporte_consultas_${fecha}`;
      const title = `Reporte de Consultas - ${new Date().toLocaleDateString('es-ES')}`;

      switch (formato) {
        case 'pdf':
          this.exportSrv.exportToPDF(datosExportar, filename, title);
          break;
        case 'excel':
          this.exportSrv.exportToExcel(datosExportar, filename);
          break;
        case 'html':
          this.exportSrv.exportToHTML(datosExportar, filename, title);
          break;
      }
    } catch (e) {
      console.error('Error al generar reporte:', e);
      this.error = `Error al generar reporte ${formato.toUpperCase()}`;
    } finally {
      this.generandoReporte = false;
    }
  }

  // ==================== UTILIDADES ====================

  private extraerError(err: any): string {
    const e = err?.error;
    if (!e) return '';
    if (typeof e === 'string') return e;
    if (e.detail) return e.detail;
    if (typeof e === 'object') {
      return Object.entries(e)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' | ');
    }
    return '';
  }

  trackById(_i: number, c: Consulta): number | undefined {
    return c.id;
  }
}
