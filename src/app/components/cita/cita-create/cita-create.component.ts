import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { CitaCreate } from '../../../models/cita/cita.model';
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
  selector: 'app-cita-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cita-create.component.html',
  styleUrl: './cita-create.component.scss',
})
export class CitaCreateComponent implements OnInit {
  @ViewChild('pacienteDropdown') pacienteDropdown!: ElementRef;
  @ViewChild('medicoDropdown') medicoDropdown!: ElementRef;

  cita: CitaCreate = {
    paciente: 0,
    medico_especialidad: 0,
    fecha_cita: '',
    hora_cita: '',
    estado: 'pendiente',
    motivo: '',
    notas: null,
  };

  // Listas completas y filtradas
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
  error: string | undefined;

  // Búsqueda
  searchPaciente: string = '';
  searchMedico: string = '';

  fechaMinima: string;

  constructor(private citaService: CitaService, private router: Router) {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarTodosPacientes();
    this.cargarTodosMedicos();
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

  // Seleccionar paciente
  seleccionarPaciente(paciente: PacienteSelect): void {
    this.cita.paciente = paciente.usuario.id;
    this.searchPaciente = paciente.nombre_completo;
    this.cerrarDropdown('paciente');
  }

  // Seleccionar médico
  seleccionarMedico(medico: MedicoEspecialidadSelect): void {
    this.cita.medico_especialidad = medico.id;
    this.searchMedico = `${medico.medico_nombre_completo} - ${medico.especialidad_nombre}`;
    this.cerrarDropdown('medico');
    this.onMedicoYFechaChange();
  }

  // Limpiar selección
  limpiarPaciente(): void {
    this.cita.paciente = 0;
    this.searchPaciente = '';
    this.pacientesFiltrados = this.todosPacientes;
  }

  limpiarMedico(): void {
    this.cita.medico_especialidad = 0;
    this.searchMedico = '';
    this.medicosFiltrados = this.todosMedicosEspecialidades;
    this.horariosDisponibles = [];
    this.cita.hora_cita = '';
  }

  // Cerrar dropdown
  cerrarDropdown(tipo: 'paciente' | 'medico'): void {
    // En una implementación real, usarías Bootstrap JavaScript
    // Por ahora, simplemente limpiamos la búsqueda
    if (tipo === 'paciente') {
      this.searchPaciente = this.getPacienteSeleccionado();
    } else {
      this.searchMedico = this.getMedicoSeleccionado();
    }
  }

  // Horarios disponibles
  onMedicoYFechaChange(): void {
    if (this.cita.medico_especialidad && this.cita.fecha_cita) {
      this.cargarHorariosDisponibles();
    } else {
      this.horariosDisponibles = [];
      this.cita.hora_cita = '';
    }
  }

  cargarHorariosDisponibles(): void {
    this.cargandoHorarios = true;
    this.horariosDisponibles = [];
    this.cita.hora_cita = '';

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
    this.cita.hora_cita = hora;
  }

  // Textos seleccionados
  getPacienteSeleccionado(): string {
    if (!this.cita.paciente) return '';
    const paciente = this.todosPacientes.find(
      (p) => p.usuario.id === this.cita.paciente
    );
    return paciente ? paciente.nombre_completo : '';
  }

  getMedicoSeleccionado(): string {
    if (!this.cita.medico_especialidad) return '';
    const medico = this.todosMedicosEspecialidades.find(
      (m) => m.id === this.cita.medico_especialidad
    );
    return medico
      ? `${medico.medico_nombre_completo} - ${medico.especialidad_nombre}`
      : '';
  }

  // Resto de métodos se mantienen igual...
  guardar(): void {
    if (this.enviando) return;

    this.enviando = true;
    this.error = undefined;

    // Validaciones...
    const fechaCita = new Date(this.cita.fecha_cita);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaCita < hoy) {
      this.error = 'La fecha de la cita debe ser hoy o en el futuro';
      this.enviando = false;
      return;
    }

    if (!this.cita.hora_cita) {
      this.error = 'Debes seleccionar una hora disponible';
      this.enviando = false;
      return;
    }

    this.citaService.createCita(this.cita).subscribe({
      next: (citaCreada) => {
        this.enviando = false;
        this.router.navigate(['/citas'], {
          queryParams: {
            mensaje: `Cita programada exitosamente para el ${this.formatearFecha(
              citaCreada.fecha_cita
            )} a las ${this.formatearHora(citaCreada.hora_cita)}`,
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
        } else {
          this.error = 'Error al programar la cita. Intenta nuevamente.';
        }

        console.error('Error creating cita:', err);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/citas']);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }
}
