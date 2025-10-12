import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Paciente, PacienteFiltros } from '../../../models/paciente/paciente.model';
import { PacienteService } from '../../../services/paciente/paciente.service';
import { ExportService } from '../../../services/exportar/export.service';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paciente-list.component.html',
})
export class PacienteListComponent implements OnInit {
  pacientes: Paciente[] = [];
  todosPacientes: Paciente[] = []; // Para exportar
  cargando = false;
  generandoReporte = false;
  error?: string;
  mensaje?: string;

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalPacientes = 0;
  tamanoPagina = 10;

  // Filtros
  terminoBusqueda = '';
  filtroGenero = '';

  // Modales
  mostrarModalEliminar = false;
  mostrarModalDetalle = false;
  pacienteSeleccionado?: Paciente;
  pacienteAEliminar?: Paciente;

  constructor(
    private srv: PacienteService,
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

    const params: any = {
      page: pagina,
      page_size: this.tamanoPagina,
    };

    // Aplicar filtros
    if (this.terminoBusqueda) {
      params.search = this.terminoBusqueda;
    }
    if (this.filtroGenero) {
      params.genero = this.filtroGenero;
    }

    this.srv.listar(params).subscribe({
      next: (respuesta) => {
        this.pacientes = respuesta.results || [];
        console.log('🧠 Pacientes cargados:', this.pacientes);
        this.totalPacientes = respuesta.count || 0;
        this.totalPaginas = Math.ceil(this.totalPacientes / this.tamanoPagina);
        this.cargando = false;
        this.cargarTodosPacientes();
      },
      error: (e) => {
        this.error = this.extraerError(e) || 'No se pudo cargar pacientes';
        this.cargando = false;
      },
    });
  }

  cargarTodosPacientes(): void {
    const filtros: PacienteFiltros = {};

    if (this.terminoBusqueda) {
      filtros.search = this.terminoBusqueda;
    }
    if (this.filtroGenero) {
      filtros.genero = this.filtroGenero;
    }

    this.srv.listarTodos(filtros).subscribe({
      next: (pacientes) => {
        this.todosPacientes = pacientes || [];
      },
      error: (e) => {
        this.todosPacientes = [];
      },
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargar(1);
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargar(1);
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroGenero = '';
    this.paginaActual = 1;
    this.cargar(1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.cargar(pagina);
    }
  }

  crear(): void {
    this.router.navigate(['/pacientes/crear']);
  }

/*  editar(id?: number): void {
    if (id == null) return;
    this.router.navigate(['/pacientes/editar', id]);
  }*/

  editar(id?: number): void {
    console.log('🧩 Ejecutando editar con id:', id);
    if (id == null) return;
    this.router.navigate(['/pacientes/editar', id]);
  }

  verDetalle(paciente: Paciente): void {
    this.pacienteSeleccionado = paciente;
    this.mostrarModalDetalle = true;
  }

/*  confirmarEliminar(paciente: Paciente): void {
    this.pacienteAEliminar = paciente;
    this.mostrarModalEliminar = true;
  }*/

  confirmarEliminar(paciente: Paciente): void {
    console.log('🟢 confirmarEliminar llamado con:', paciente);
    this.pacienteAEliminar = { ...paciente }; // CREA UNA COPIA
    this.mostrarModalEliminar = true;
    console.log('🟢 pacienteAEliminar asignado:', this.pacienteAEliminar);
  }

  // SOLO UN MÉTODO ELIMINAR - ELIMINA LOS OTROS
  eliminar(): void {
  // Validamos que haya paciente seleccionado
  if (!this.pacienteAEliminar) {
    console.error('❌ No hay paciente seleccionado para eliminar.');
    return;
  }

  // Tomamos el id del paciente (no del usuario)
  const idPaciente = this.pacienteAEliminar.id || this.pacienteAEliminar.usuario?.id;
  const nombre = this.pacienteAEliminar.nombre_completo;

  if (!idPaciente) {
    console.error('❌ No se encontró ID del paciente o usuario.');
    return;
  }

  // Cerramos el modal
  this.mostrarModalEliminar = false;
  this.pacienteAEliminar = undefined;

  // 🔥 Llamada DELETE al backend (borra paciente + usuario)
  this.srv.eliminar(idPaciente).subscribe({
    next: () => {
      console.log('✅ Paciente y usuario eliminados correctamente:', idPaciente);
      this.mensaje = `Paciente "${nombre}" eliminado exitosamente.`;
      this.cargar(this.paginaActual);
    },
    error: (e) => {
      console.error('❌ Error al eliminar paciente:', e);
      this.error = this.extraerError(e) || 'No se pudo eliminar el paciente';
      this.cargar(this.paginaActual);
    },
  });
}



  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.pacienteAEliminar = undefined;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.pacienteSeleccionado = undefined;
  }

  generarReportePDF(): void {
    this.generarReporte('pdf');
  }

  generarReporteExcel(): void {
    this.generarReporte('excel');
  }

  private generarReporte(formato: 'pdf' | 'excel'): void {
    if (this.todosPacientes.length === 0) {
      this.error = 'No hay datos para generar el reporte';
      return;
    }

    this.generandoReporte = true;
    this.error = undefined;

    try {
      const datosExportar = this.exportSrv.prepararDatosPacientes(this.todosPacientes);
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `reporte_pacientes_${fecha}`;
      const title = `Reporte de Pacientes - ${new Date().toLocaleDateString('es-ES')}`;

      if (formato === 'pdf') {
        this.exportSrv.exportToPDF(datosExportar, filename, title);
      } else {
        this.exportSrv.exportToExcel(datosExportar, filename);
      }
    } catch (error) {
      this.error = `Error al generar el reporte ${formato.toUpperCase()}`;
    } finally {
      this.generandoReporte = false;
    }
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearGenero(genero: string | null | undefined): string {
    switch (genero) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'O': return 'Otro';
      default: return '—';
    }
  }

  trackById(_i: number, p: Paciente): number | undefined {
    return p.id;
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
}