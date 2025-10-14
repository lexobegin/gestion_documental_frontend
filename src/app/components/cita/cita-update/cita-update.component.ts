import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cita, CitaUpdate } from '../../../models/cita/cita.model';
import {
  CitaService,
  PacienteSelect,
  MedicoEspecialidadSelect,
  HorariosDisponibles,
} from '../../../services/cita/cita.service';

interface HorarioDisponible {
  hora: string;
  disponible: boolean;
}

@Component({
  selector: 'app-cita-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cita-update.component.html',
  styleUrl: './cita-update.component.scss',
})
export class CitaUpdateComponent implements OnInit {
  @ViewChild('pacienteDropdown') pacienteDropdown!: ElementRef;
  @ViewChild('medicoDropdown') medicoDropdown!: ElementRef;

  cita: Cita | null = null;

  // Listas para los dropdowns
  todosPacientes: PacienteSelect[] = [];
  todosMedicosEspecialidades: MedicoEspecialidadSelect[] = [];
  pacientesFiltrados: PacienteSelect[] = [];
  medicosFiltrados: MedicoEspecialidadSelect[] = [];

  horariosDisponibles: HorarioDisponible[] = [];

  // Estados
  cargandoPacientes: boolean = false;
  cargandoMedicos: boolean = false;
  cargandoHorarios: boolean = false;
  enviando: boolean = false;
  cargando: boolean = false;
  error: string | undefined;

  // Búsqueda
  searchPaciente: string = '';
  searchMedico: string = '';

  fechaMinima: string;
  private citaId!: number;

  constructor(
    private citaService: CitaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.citaId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.citaId) {
      this.cargarCita();
      this.cargarTodosPacientes();
      this.cargarTodosMedicos();
    } else {
      this.error = 'ID de cita no válido';
    }
  }

  cargarCita(): void {
    this.cargando = true;
    this.error = undefined;

    this.citaService.getCitaById(this.citaId).subscribe({
      next: (cita) => {
        this.cita = cita;
        this.searchPaciente =
          cita.paciente_nombre + ' ' + cita.paciente_apellido;
        this.searchMedico = `Dr. ${cita.medico_nombre} ${cita.medico_apellido} - ${cita.especialidad_nombre}`;

        // Si ya hay médico y fecha, cargar horarios disponibles
        if (this.cita.medico_id && this.cita.fecha_cita) {
          this.cargarHorariosDisponibles();
        }

        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la cita';
        this.cargando = false;
        console.error('Error loading cita:', err);
      },
    });
  }

  cargarTodosPacientes(): void {
    this.cargandoPacientes = true;
    this.citaService.buscarPacientes().subscribe({
      next: (pacientes) => {
        this.todosPacientes = pacientes;
        this.pacientesFiltrados = pacientes;
        this.cargandoPacientes = false;
      },
      error: (err) => {
        this.cargandoPacientes = false;
        console.error('Error cargando pacientes:', err);
      },
    });
  }

  cargarTodosMedicos(): void {
    this.cargandoMedicos = true;
    this.citaService.buscarMedicoEspecialidades().subscribe({
      next: (medicos) => {
        this.todosMedicosEspecialidades = medicos;
        this.medicosFiltrados = medicos;
        this.cargandoMedicos = false;
      },
      error: (err) => {
        this.cargandoMedicos = false;
        console.error('Error cargando médicos:', err);
      },
    });
  }

  // Filtrar pacientes
  filtrarPacientes(): void {
    if (!this.searchPaciente.trim()) {
      this.pacientesFiltrados = this.todosPacientes;
    } else {
      const termino = this.searchPaciente.toLowerCase();
      this.pacientesFiltrados = this.todosPacientes.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(termino) ||
          p.email.toLowerCase().includes(termino) ||
          p.usuario.nombre.toLowerCase().includes(termino) ||
          p.usuario.apellido.toLowerCase().includes(termino)
      );
    }
  }

  // Filtrar médicos
  filtrarMedicos(): void {
    if (!this.searchMedico.trim()) {
      this.medicosFiltrados = this.todosMedicosEspecialidades;
    } else {
      const termino = this.searchMedico.toLowerCase();
      this.medicosFiltrados = this.todosMedicosEspecialidades.filter(
        (me) =>
          me.medico_nombre_completo.toLowerCase().includes(termino) ||
          me.especialidad_nombre.toLowerCase().includes(termino) ||
          me.especialidad_codigo.toLowerCase().includes(termino)
      );
    }
  }

  // Seleccionar paciente (solo si la cita no está realizada/cancelada)
  seleccionarPaciente(paciente: PacienteSelect): void {
    if (
      this.cita &&
      this.cita.estado !== 'realizada' &&
      this.cita.estado !== 'cancelada'
    ) {
      this.cita.paciente = paciente.usuario.id;
      this.cita.paciente_nombre = paciente.usuario.nombre;
      this.cita.paciente_apellido = paciente.usuario.apellido;
      this.searchPaciente = paciente.nombre_completo;
      this.cerrarDropdown('paciente');
    }
  }

  // Seleccionar médico (solo si la cita no está realizada/cancelada)
  seleccionarMedico(medico: MedicoEspecialidadSelect): void {
    if (
      this.cita &&
      this.cita.estado !== 'realizada' &&
      this.cita.estado !== 'cancelada'
    ) {
      this.cita.medico_especialidad = medico.id;
      this.cita.medico_id = medico.medico;
      this.cita.medico_nombre =
        medico.medico_nombre_completo.split('Dr. ')[1]?.split(' ')[0] || '';
      this.cita.medico_apellido =
        medico.medico_nombre_completo
          .split('Dr. ')[1]
          ?.split(' ')
          .slice(1)
          .join(' ') || '';
      this.cita.especialidad_id = medico.especialidad;
      this.cita.especialidad_nombre = medico.especialidad_nombre;
      this.searchMedico = `${medico.medico_nombre_completo} - ${medico.especialidad_nombre}`;
      this.cerrarDropdown('medico');
      this.onMedicoYFechaChange();
    }
  }

  // Cerrar dropdown
  cerrarDropdown(tipo: 'paciente' | 'medico'): void {
    // Limpiar búsqueda manteniendo la selección
    if (tipo === 'paciente' && this.cita) {
      this.searchPaciente =
        this.cita.paciente_nombre + ' ' + this.cita.paciente_apellido;
    } else if (tipo === 'medico' && this.cita) {
      this.searchMedico = `Dr. ${this.cita.medico_nombre} ${this.cita.medico_apellido} - ${this.cita.especialidad_nombre}`;
    }
  }

  // Horarios disponibles
  onMedicoYFechaChange(): void {
    if (this.cita && this.cita.medico_especialidad && this.cita.fecha_cita) {
      this.cargarHorariosDisponibles();
    } else {
      this.horariosDisponibles = [];
      if (this.cita) {
        this.cita.hora_cita = '';
      }
    }
  }

  cargarHorariosDisponibles(): void {
    if (!this.cita) return;

    this.cargandoHorarios = true;
    this.horariosDisponibles = [];

    this.citaService
      .obtenerHorariosDisponibles(
        this.cita.medico_especialidad,
        this.cita.fecha_cita
      )
      .subscribe({
        next: (response: HorariosDisponibles) => {
          this.horariosDisponibles = response.horas_disponibles.map((hora) => ({
            hora: hora + ':00',
            disponible: true,
          }));
          this.cargandoHorarios = false;
        },
        error: (err) => {
          this.cargandoHorarios = false;
          this.error = 'Error al cargar horarios disponibles';
          console.error('Error loading available hours:', err);
        },
      });
  }

  seleccionarHora(hora: string): void {
    if (
      this.cita &&
      this.cita.estado !== 'realizada' &&
      this.cita.estado !== 'cancelada'
    ) {
      this.cita.hora_cita = hora;
    }
  }

  // Verificar si la cita es editable
  esEditable(): boolean {
    return this.cita
      ? this.cita.estado !== 'realizada' && this.cita.estado !== 'cancelada'
      : false;
  }

  guardar(): void {
    if (!this.cita || this.enviando) return;

    this.enviando = true;
    this.error = undefined;

    const datosActualizacion: CitaUpdate = {
      fecha_cita: this.cita.fecha_cita,
      hora_cita: this.cita.hora_cita,
      estado: this.cita.estado,
      motivo: this.cita.motivo,
      notas: this.cita.notas,
    };

    this.citaService.updateCita(this.citaId, datosActualizacion).subscribe({
      next: (citaActualizada) => {
        this.enviando = false;
        this.router.navigate(['/citas'], {
          queryParams: {
            mensaje: `Cita actualizada exitosamente`,
            tipo: 'success',
          },
        });
      },
      error: (err) => {
        this.enviando = false;

        if (err.status === 400) {
          this.error = 'Datos inválidos. Verifica la información ingresada.';
          if (err.error) {
            const errores = Object.values(err.error).flat();
            if (errores.length > 0) {
              this.error = errores.join(', ');
            }
          }
        } else if (err.status === 404) {
          this.error = 'La cita no fue encontrada';
        } else {
          this.error = 'Error al actualizar la cita. Intenta nuevamente.';
        }

        console.error('Error updating cita:', err);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/citas']);
  }

  volverALista(): void {
    this.router.navigate(['/citas']);
  }

  formatearFechaHora(fechaHora: string): string {
    return new Date(fechaHora).toLocaleString('es-ES');
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }
}
