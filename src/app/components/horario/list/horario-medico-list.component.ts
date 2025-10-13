import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ExportService } from '../../../services/exportar/export.service';

@Component({
  selector: 'app-horario-medico-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './horario-medico-list.component.html',
  styleUrls: ['./horario-medico-list.component.css']
})
export class HorarioMedicoListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private exportSrv = inject(ExportService);

  baseUrl = 'http://localhost:8000/api/horarios-medico/';
  horarios: any[] = [];
  horariosFiltrados: any[] = [];
  todosHorarios: any[] = [];
  filtro: string = '';

  // Estado
  cargando = false;
  error?: string;
  generandoReporte = false;

  // Paginación
  nextPageUrl: string | null = null;
  prevPageUrl: string | null = null;
  currentPage = 1;
  totalRegistros = 0;
  paginas: number[] = [];

  // Modales
  mostrarModalEliminar = false;
  mostrarModalDetalle = false;
  horarioSeleccionado?: any;
  horarioAEliminar?: any;

  ngOnInit(): void {
    this.cargarHorarios(this.baseUrl);

    // Refrescar cuando se vuelve a la ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/horarios') this.cargarHorarios(this.baseUrl);
      });
  }

  /** ==================== CARGA Y FILTROS ==================== */
  cargarHorarios(url: string) {
    this.cargando = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    this.http.get<any>(url, { headers }).subscribe({
      next: (data) => {
        this.horarios = (data.results || []).sort((a: any, b: any) => b.id - a.id);
        this.horariosFiltrados = this.horarios;
        this.nextPageUrl = data.next;
        this.prevPageUrl = data.previous;
        this.totalRegistros = data.count || this.horarios.length;
        this.calcularPaginas(this.totalRegistros);
        this.cargando = false;
        this.cargarTodosHorarios(); // Para exportación
      },
      error: (err) => {
        console.error('❌ Error cargando horarios:', err);
        this.error = 'No se pudo cargar la lista de horarios';
        this.cargando = false;
      }
    });
  }

  cargarTodosHorarios() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    const url = this.baseUrl + '?page_size=1000';
    this.http.get<any>(url, { headers }).subscribe({
      next: (data) => {
        this.todosHorarios = data.results || [];
      },
      error: (err) => {
        console.error('❌ Error cargando horarios para exportar:', err);
        this.todosHorarios = [];
      }
    });
  }

  filtrarHorarios() {
    const term = this.filtro.toLowerCase();
    this.horariosFiltrados = this.horarios.filter(h =>
      h.medico_nombre.toLowerCase().includes(term) ||
      h.medico_apellido.toLowerCase().includes(term) ||
      h.especialidad_nombre.toLowerCase().includes(term) ||
      h.dia_semana.toLowerCase().includes(term)
    );
  }

  limpiarFiltro() {
    this.filtro = '';
    this.horariosFiltrados = this.horarios;
  }

  /** ==================== Paginación ==================== */
  siguientePagina() {
    if (this.nextPageUrl) {
      this.currentPage++;
      this.cargarHorarios(this.nextPageUrl);
    }
  }

  paginaAnterior() {
    if (this.prevPageUrl) {
      this.currentPage--;
      this.cargarHorarios(this.prevPageUrl);
    }
  }

  irAPagina(num: number) {
    const url = `${this.baseUrl}?page=${num}`;
    this.currentPage = num;
    this.cargarHorarios(url);
  }

  private calcularPaginas(total: number, pageSize: number = 10) {
    const totalPaginas = Math.ceil(total / pageSize);
    this.paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  /** ==================== ACCIONES CRUD ==================== */
  nuevoHorario() {
    this.router.navigate(['/horarios/create']);
  }

  editarHorario(id: number) {
    this.router.navigate(['/horarios/update', id]);
  }

  confirmarEliminar(horario: any) {
    this.horarioAEliminar = horario;
    this.mostrarModalEliminar = true;
  }

  eliminarHorarioConfirmado() {
    if (!this.horarioAEliminar?.id) return;
    const id = this.horarioAEliminar.id;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    this.http.delete(this.baseUrl + id + '/', { headers }).subscribe({
      next: () => {
        this.horarios = this.horarios.filter(h => h.id !== id);
        this.horariosFiltrados = this.horarios;
        this.totalRegistros--;
        this.mostrarModalEliminar = false;
      },
      error: (err) => {
        console.error('❌ Error eliminando horario:', err);
        this.error = 'No se pudo eliminar el horario';
      }
    });
  }

  cancelarEliminar() {
    this.mostrarModalEliminar = false;
    this.horarioAEliminar = undefined;
  }

  verDetalle(horario: any) {
    this.horarioSeleccionado = horario;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.horarioSeleccionado = undefined;
  }

  /** ==================== EXPORTACIÓN ==================== */
  generarReportePDF() {
    this.generarReporte('pdf');
  }

  generarReporteExcel() {
    this.generarReporte('excel');
  }

  generarReporteHTML() {
    this.generarReporte('html');
  }

  private generarReporte(formato: 'pdf' | 'excel' | 'html') {
    if (this.todosHorarios.length === 0) {
      this.error = 'No hay datos para generar el reporte';
      return;
    }

    this.generandoReporte = true;
    try {
      const datosExportar = this.todosHorarios.map(h => ({
        ID: h.id,
        Médico: `${h.medico_nombre} ${h.medico_apellido}`,
        Especialidad: h.especialidad_nombre,
        Día: h.dia_semana,
        'Hora Inicio': h.hora_inicio,
        'Hora Fin': h.hora_fin,
        Estado: h.activo ? 'Activo' : 'Inactivo'
      }));

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `reporte_horarios_${fecha}`;
      const title = `Reporte de Horarios Médicos - ${new Date().toLocaleDateString('es-ES')}`;

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
    } catch (error) {
      console.error(`Error al generar reporte ${formato}:`, error);
      this.error = `Error al generar el reporte ${formato.toUpperCase()}`;
    } finally {
      this.generandoReporte = false;
    }
  }
}