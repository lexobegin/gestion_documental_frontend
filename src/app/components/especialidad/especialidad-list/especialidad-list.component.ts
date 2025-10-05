import { Component, OnInit } from '@angular/core';
import {
  Especialidad,
  ApiResponse,
} from '../../../models/especialidad/especialidad.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../../services/especialidad/especialidad.service';

@Component({
  selector: 'app-especialidad-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidad-list.component.html',
  styleUrl: './especialidad-list.component.scss',
})
export class EspecialidadListComponent implements OnInit {
  // Datos y estado
  especialidades: Especialidad[] = [];
  todasEspecialidades: Especialidad[] = [];
  especialidadSeleccionada: Especialidad | null = null;
  especialidadAEliminar: Especialidad | null = null;

  // Estado de UI
  cargando: boolean = false;
  generandoReporte: boolean = false;
  error: string | undefined;
  mostrarModalDetalle: boolean = false;
  mostrarModalEliminar: boolean = false;

  // Búsqueda y paginación
  terminoBusqueda: string = '';
  paginaActual: number = 1;
  totalEspecialidades: number = 0;
  totalPaginas: number = 0;
  limitePorPagina: number = 10;

  constructor(
    private especialidadService: EspecialidadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarTodasEspecialidades();
  }

  // Carga de datos
  cargarEspecialidades(pagina: number = 1): void {
    this.cargando = true;
    this.error = undefined;

    const params = {
      page: pagina,
      ...(this.terminoBusqueda && { search: this.terminoBusqueda }),
    };

    this.especialidadService.getEspecialidades(params).subscribe({
      next: (response: ApiResponse<Especialidad>) => {
        this.especialidades = response.results;
        this.totalEspecialidades = response.count;
        this.totalPaginas = Math.ceil(response.count / this.limitePorPagina);
        this.paginaActual = pagina;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las especialidades';
        this.cargando = false;
        console.error('Error loading especialidades:', err);
      },
    });
  }

  // Búsqueda y filtros
  buscar(): void {
    this.paginaActual = 1;
    this.cargarEspecialidades(1);
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.cargarEspecialidades(1);
  }

  // Paginación
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.cargarEspecialidades(pagina);
    }
  }

  // Navegación
  crear(): void {
    this.router.navigate(['/especialidades/crear']);
  }

  editar(id: number): void {
    this.router.navigate(['/especialidades/editar', id]);
  }

  // Modales de detalle
  verDetalle(especialidad: Especialidad): void {
    this.especialidadSeleccionada = especialidad;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.especialidadSeleccionada = null;
  }

  // Eliminación
  confirmarEliminar(especialidad: Especialidad): void {
    this.especialidadAEliminar = especialidad;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.especialidadAEliminar = null;
  }

  eliminar(): void {
    if (!this.especialidadAEliminar) return;

    this.especialidadService
      .deleteEspecialidad(this.especialidadAEliminar.id)
      .subscribe({
        next: () => {
          this.mostrarModalEliminar = false;
          this.especialidadAEliminar = null;
          this.cargarEspecialidades(this.paginaActual);
        },
        error: (err) => {
          if (err.status === 400) {
            this.error =
              'No se puede eliminar la especialidad porque está asociada a uno o más médicos.';
          } else {
            this.error = 'Error al eliminar la especialidad';
          }
          this.mostrarModalEliminar = false;
          console.error('Error deleting especialidad:', err);
        },
      });
  }

  // Utilidades
  trackById(index: number, item: Especialidad): number {
    return item.id;
  }

  contarMedicos(especialidad: Especialidad): number {
    return especialidad.medicos_count || 0;
  }

  // Exportación
  generarReportePDF(): void {
    this.generandoReporte = true;
    // Implementar lógica de PDF
    setTimeout(() => {
      this.generandoReporte = false;
      alert('PDF generado (funcionalidad por implementar)');
    }, 1000);
  }

  generarReporteExcel(): void {
    this.generandoReporte = true;
    // Implementar lógica de Excel
    setTimeout(() => {
      this.generandoReporte = false;
      alert('Excel generado (funcionalidad por implementar)');
    }, 1000);
  }

  generarReporteHTML(): void {
    this.generandoReporte = true;
    // Implementar lógica de HTML
    setTimeout(() => {
      this.generandoReporte = false;
      alert('HTML generado (funcionalidad por implementar)');
    }, 1000);
  }

  // Cargar todas las especialidades para exportación
  cargarTodasEspecialidades(): void {
    this.especialidadService.getAllEspecialidades().subscribe({
      next: (especialidades) => {
        this.todasEspecialidades = especialidades;
      },
      error: (err) => {
        console.error('Error loading all especialidades:', err);
      },
    });
  }
}
