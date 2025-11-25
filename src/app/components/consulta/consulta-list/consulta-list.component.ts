import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Consulta, ApiResponse } from '../../../models/consulta/consulta.model';
import {
  Cita,
  ApiResponse as CitaApiResponse,
} from '../../../models/cita/cita.model';
import { ConsultaService } from '../../../services/consulta/consulta.service';
import { CitaService } from '../../../services/cita/cita.service';

@Component({
  selector: 'app-consulta-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-list.component.html',
  styleUrls: ['./consulta-list.component.scss'],
})
export class ConsultaListComponent implements OnInit {
  // Datos para las tablas
  citas: Cita[] = [];
  consultas: Consulta[] = [];

  // Estados de carga
  cargandoCitas: boolean = false;
  cargandoConsultas: boolean = false;
  error: string | undefined;

  // Búsqueda y paginación para CITAS
  terminoBusquedaCitas: string = '';
  paginaActualCitas: number = 1;
  totalCitas: number = 0;
  totalPaginasCitas: number = 0;

  // Búsqueda y paginación para CONSULTAS
  terminoBusquedaConsultas: string = '';
  paginaActualConsultas: number = 1;
  totalConsultas: number = 0;
  totalPaginasConsultas: number = 0;

  // Modal de historial
  mostrarModalHistorial: boolean = false;
  consultaSeleccionada: Consulta | null = null;

  // Límites por página
  readonly limitePorPagina: number = 10;

  constructor(
    private consultaService: ConsultaService,
    private citaService: CitaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarConsultas();
  }

  // ========== MÉTODOS PARA CITAS ==========
  cargarCitas(pagina: number = 1): void {
    this.cargandoCitas = true;
    this.error = undefined;

    const params: any = {
      page: pagina,
      ordering: '-fecha_cita,-hora_cita',
      estado: 'confirmada', // Solo mostrar citas realizadas para crear consultas
    };

    if (this.terminoBusquedaCitas) {
      params.search = this.terminoBusquedaCitas;
    }

    this.citaService.getCitas(params).subscribe({
      next: (response: CitaApiResponse<Cita>) => {
        this.citas = response.results;
        this.totalCitas = response.count;
        this.totalPaginasCitas = Math.ceil(
          response.count / this.limitePorPagina
        );
        this.paginaActualCitas = pagina;
        this.cargandoCitas = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las citas';
        this.cargandoCitas = false;
        console.error('Error loading citas:', err);
      },
    });
  }

  buscarCitas(): void {
    this.paginaActualCitas = 1;
    this.cargarCitas(1);
  }

  limpiarBusquedaCitas(): void {
    this.terminoBusquedaCitas = '';
    this.paginaActualCitas = 1;
    this.cargarCitas(1);
  }

  cambiarPaginaCitas(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasCitas) {
      this.cargarCitas(pagina);
    }
  }

  // Crear consulta desde cita
  crearConsultaDesdeCita(cita: Cita): void {
    // Navegar al componente de creación pasando los datos de la cita
    this.router.navigate(['consulta-create'], {
      queryParams: {
        paciente_id: cita.paciente,
        paciente_nombre: cita.paciente_nombre,
        paciente_apellido: cita.paciente_apellido,
        motivo: cita.motivo,
        medico_id: cita.medico_id,
        cita_id: cita.id,
      },
    });
  }

  // ========== MÉTODOS PARA CONSULTAS ==========
  cargarConsultas(pagina: number = 1): void {
    this.cargandoConsultas = true;
    this.error = undefined;

    const params: any = {
      page: pagina,
      ordering: '-fecha_consulta',
    };

    if (this.terminoBusquedaConsultas) {
      params.search = this.terminoBusquedaConsultas;
    }

    this.consultaService.getConsultas(params).subscribe({
      next: (response: ApiResponse<Consulta>) => {
        this.consultas = response.results;
        this.totalConsultas = response.count;
        this.totalPaginasConsultas = Math.ceil(
          response.count / this.limitePorPagina
        );
        this.paginaActualConsultas = pagina;
        this.cargandoConsultas = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las consultas';
        this.cargandoConsultas = false;
        console.error('Error loading consultas:', err);
      },
    });
  }

  buscarConsultas(): void {
    this.paginaActualConsultas = 1;
    this.cargarConsultas(1);
  }

  limpiarBusquedaConsultas(): void {
    this.terminoBusquedaConsultas = '';
    this.paginaActualConsultas = 1;
    this.cargarConsultas(1);
  }

  cambiarPaginaConsultas(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasConsultas) {
      this.cargarConsultas(pagina);
    }
  }

  // ========== MÉTODOS PARA HISTORIAL ==========
  verHistorial(consulta: Consulta): void {
    this.consultaSeleccionada = consulta;
    this.mostrarModalHistorial = true;
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.consultaSeleccionada = null;
  }

  editarConsulta(id: number): void {
    this.router.navigate(['/consultas/editar', id]);
  }

  //NUEVO MÉTODO para botón de Exámenes Médicos
  gestionarExamenes(id: number): void {
    this.router.navigate(['/consulta-examenes', id]);
  }

  // NUEVO MÉTODO para botón de Recetas Médicas
  gestionarRecetas(id: number): void {
  this.router.navigate(['/consultas/recetas', id]);
}

  // ========== UTILIDADES ==========
  trackById(index: number, item: any): number {
    return item.id;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearFechaHora(fechaHora: string): string {
    return new Date(fechaHora).toLocaleString('es-ES');
  }

  formatearHora(hora: string): string {
    if (!hora) return '--:--';
    return hora.substring(0, 5);
  }

  truncarTexto(texto: string | null, longitud: number = 50): string {
    if (!texto) return '—';
    return texto.length > longitud
      ? texto.substring(0, longitud) + '...'
      : texto;
  }
}
