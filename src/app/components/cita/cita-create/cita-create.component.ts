import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaCreate } from '../../../models/cita/cita.model';
import { CitaService } from '../../../services/cita/cita.service';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface MedicoEspecialidad {
  id: number;
  medico_id: number;
  medico_nombre: string;
  medico_apellido: string;
  especialidad_id: number;
  especialidad_nombre: string;
}

@Component({
  selector: 'app-cita-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cita-create.component.html',
  styleUrl: './cita-create.component.scss',
})
export class CitaCreateComponent implements OnInit {
  cita: CitaCreate = {
    paciente: 0,
    medico_especialidad: 0,
    fecha_cita: '',
    hora_cita: '',
    estado: 'pendiente',
    motivo: '',
    notas: '',
  };

  pacientes: Paciente[] = [];
  medicosEspecialidades: MedicoEspecialidad[] = [];

  enviando: boolean = false;
  cargando: boolean = false;
  error: string | undefined;

  fechaMinima: string;

  constructor(private citaService: CitaService, private router: Router) {
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.cargando = true;

    // Simular carga de pacientes y médicos
    // En una implementación real, harías llamadas HTTP aquí
    setTimeout(() => {
      this.pacientes = [
        {
          id: 13,
          nombre: 'Carlos',
          apellido: 'López',
          email: 'carlos@email.com',
        },
        { id: 14, nombre: 'Ana', apellido: 'Martínez', email: 'ana@email.com' },
        { id: 15, nombre: 'Luis', apellido: 'García', email: 'luis@email.com' },
      ];

      this.medicosEspecialidades = [
        {
          id: 4,
          medico_id: 5,
          medico_nombre: 'Elena',
          medico_apellido: 'Martínez',
          especialidad_id: 7,
          especialidad_nombre: 'Ginecología',
        },
        {
          id: 5,
          medico_id: 6,
          medico_nombre: 'Roberto',
          medico_apellido: 'González',
          especialidad_id: 2,
          especialidad_nombre: 'Cardiología',
        },
        {
          id: 6,
          medico_id: 7,
          medico_nombre: 'María',
          medico_apellido: 'Rodríguez',
          especialidad_id: 3,
          especialidad_nombre: 'Pediatría',
        },
      ];

      this.cargando = false;
    }, 1000);
  }

  onMedicoChange(): void {
    // Aquí podrías cargar horarios disponibles del médico seleccionado
    console.log(
      'Médico-Especialidad seleccionado:',
      this.cita.medico_especialidad
    );
  }

  // Actualizar función para obtener nombre
  getMedicoEspecialidadNombre(medicoEspecialidadId: number): string {
    const me = this.medicosEspecialidades.find(
      (item) => item.id === medicoEspecialidadId
    );
    return me
      ? `Dr. ${me.medico_nombre} ${me.medico_apellido} - ${me.especialidad_nombre}`
      : '';
  }

  guardar(): void {
    if (this.enviando) return;

    this.enviando = true;
    this.error = undefined;

    // Validar fecha futura
    const fechaCita = new Date(this.cita.fecha_cita);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaCita < hoy) {
      this.error = 'La fecha de la cita debe ser hoy o en el futuro';
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
            )}`,
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

  // Utilidades
  getPacienteNombre(pacienteId: number): string {
    const paciente = this.pacientes.find((p) => p.id === pacienteId);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : '';
  }

  /*getMedicoNombre(medicoId: number): string {
    const medico = this.medicos.find((m) => m.id === medicoId);
    return medico ? `Dr. ${medico.nombre} ${medico.apellido}` : '';
  }*/

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}
