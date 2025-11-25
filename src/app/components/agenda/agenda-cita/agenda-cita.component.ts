import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventClickArg,
  EventInput,
  EventChangeArg,
  EventDropArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Cita } from '../../../models/cita/cita.model';
import { CitaService } from '../../../services/cita/cita.service';

@Component({
  selector: 'app-agenda-cita',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './agenda-cita.component.html',
  styleUrl: './agenda-cita.component.scss',
})
export class AgendaCitaComponent implements OnInit {
  citas: Cita[] = [];
  cargando: boolean = false;
  error: string | undefined;
  reprogCargando: boolean = false;

  // Variables para el modal de horas disponibles
  mostrarModalHoras: boolean = false;
  horasDisponibles: string[] = [];
  fechaSeleccionada: string = '';
  medicoEspecialidadId: number | null = null;
  citaSeleccionada: any = null;
  tipoOperacion: 'drop' | 'resize' | null = null;
  dropInfoBackup: any = null;
  resizeInfoBackup: any = null;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'nuevaCita, prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    customButtons: {
      nuevaCita: {
        text: '+ Nueva Cita',
        click: this.crearNuevaCita.bind(this),
      },
    },
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    selectable: true,
    editable: true,
    droppable: true,
    eventDurationEditable: true,
    eventStartEditable: true,
    eventColor: '#3788d8',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    weekends: true,
    locale: 'es',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista',
    },
    allDayText: 'Todo el día',
    height: 'auto',
    contentHeight: 'auto',
    dragRevertDuration: 500,
    dragScroll: true,
    eventDragMinDistance: 10,
    longPressDelay: 0,
  };

  constructor(
    private citaService: CitaService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCitasParaCalendario();
  }

  cargarCitasParaCalendario(): void {
    this.cargando = true;
    this.error = undefined;

    this.citaService
      .getCitasSinPaginacion({ ordering: 'fecha_cita,hora_cita' })
      .subscribe({
        next: (response) => {
          console.log('response: ', response);

          this.citas = response;

          this.calendarOptions.events = this.mapearCitasAEventos(this.citas);
          this.cargando = false;
          this.cdRef.detectChanges();
        },
        error: (err) => {
          this.error = 'Error al cargar las citas para el calendario';
          this.cargando = false;
          console.error('Error loading citas for calendar:', err);
        },
      });
  }

  mapearCitasAEventos(citas: Cita[]): EventInput[] {
    return citas.map((cita) => {
      const fechaHora = new Date(`${cita.fecha_cita}T${cita.hora_cita}`);
      const fechaHoraFin = new Date(fechaHora);
      fechaHoraFin.setHours(fechaHora.getHours() + 1);

      return {
        id: cita.id.toString(),
        title: `${cita.paciente_nombre} ${cita.paciente_apellido}`,
        start: fechaHora,
        end: fechaHoraFin,
        backgroundColor: this.getColorPorEstado(cita.estado),
        borderColor: this.getColorPorEstado(cita.estado),
        textColor: '#ffffff',
        extendedProps: {
          paciente: `${cita.paciente_nombre} ${cita.paciente_apellido}`,
          medico: `Dr. ${cita.medico_nombre} ${cita.medico_apellido}`,
          especialidad: cita.especialidad_nombre,
          estado: cita.estado,
          motivo: cita.motivo,
          notas: cita.notas,
          paciente_id: cita.paciente,
          medico_id: cita.medico_id,
          especialidad_id: cita.especialidad_id,
          citaOriginal: cita,
        },
        editable: cita.estado !== 'realizada' && cita.estado !== 'cancelada',
      };
    });
  }

  // Manejar cuando se arrastra y suelta una cita
  handleEventDrop(dropInfo: EventDropArg): void {
    const evento = dropInfo.event;
    const extendedProps = evento.extendedProps;
    const nuevaFecha = evento.start!;

    // Verificar si la cita es editable usando los extendedProps
    const citaOriginal: Cita = extendedProps['citaOriginal'];
    if (
      citaOriginal.estado === 'realizada' ||
      citaOriginal.estado === 'cancelada'
    ) {
      dropInfo.revert();
      this.error = 'No se puede reprogramar una cita realizada o cancelada';
      return;
    }

    // Guardar información para usar después de seleccionar hora
    this.citaSeleccionada = {
      id: parseInt(evento.id),
      evento: evento,
      extendedProps: extendedProps,
    };

    this.dropInfoBackup = dropInfo;
    this.tipoOperacion = 'drop';
    this.fechaSeleccionada = this.formatearFechaParaAPI(nuevaFecha);
    this.medicoEspecialidadId = extendedProps['especialidad_id'];

    // Cargar horas disponibles
    this.cargarHorasDisponibles();
  }

  // Manejar cuando se cambia la duración de una cita
  handleEventResize(resizeInfo: EventChangeArg): void {
    const evento = resizeInfo.event;
    const extendedProps = evento.extendedProps;
    const nuevaFecha = evento.start!;

    // Verificar si la cita es editable usando los extendedProps
    const citaOriginal: Cita = extendedProps['citaOriginal'];
    if (
      citaOriginal.estado === 'realizada' ||
      citaOriginal.estado === 'cancelada'
    ) {
      resizeInfo.revert();
      this.error = 'No se puede modificar una cita realizada o cancelada';
      return;
    }

    // Guardar información para usar después de seleccionar hora
    this.citaSeleccionada = {
      id: parseInt(evento.id),
      evento: evento,
      extendedProps: extendedProps,
    };

    this.resizeInfoBackup = resizeInfo;
    this.tipoOperacion = 'resize';
    this.fechaSeleccionada = this.formatearFechaParaAPI(nuevaFecha);
    this.medicoEspecialidadId = extendedProps['especialidad_id'];

    // Cargar horas disponibles
    this.cargarHorasDisponibles();
  }

  // Cargar horas disponibles desde el API
  cargarHorasDisponibles(): void {
    if (!this.medicoEspecialidadId) {
      this.error = 'No se pudo identificar la especialidad del médico';
      return;
    }

    this.cargando = true;

    this.citaService
      .getHorasDisponibles(this.medicoEspecialidadId, this.fechaSeleccionada)
      .subscribe({
        next: (response) => {
          this.horasDisponibles = response.horas_disponibles;
          this.mostrarModalHoras = true;
          this.cargando = false;
          this.cdRef.detectChanges();
        },
        error: (err) => {
          this.cargando = false;
          this.error = 'Error al cargar las horas disponibles';
          console.error('Error loading available hours:', err);

          // Revertir la operación si hay error
          if (this.tipoOperacion === 'drop' && this.dropInfoBackup) {
            this.dropInfoBackup.revert();
          } else if (this.tipoOperacion === 'resize' && this.resizeInfoBackup) {
            this.resizeInfoBackup.revert();
          }
        },
      });
  }

  // Seleccionar hora del modal
  seleccionarHora(hora: string): void {
    if (!this.citaSeleccionada) return;

    const fechaHoraCompleta = new Date(`${this.fechaSeleccionada}T${hora}`);

    const datosActualizacion = {
      fecha_cita: this.fechaSeleccionada,
      hora_cita: hora,
    };

    this.reprogCargando = true;
    this.mostrarModalHoras = false;
    console.log('DATOS: ', datosActualizacion);

    this.citaService
      .updateCitaCalendar(this.citaSeleccionada.id, datosActualizacion)
      .subscribe({
        next: (citaActualizada) => {
          this.reprogCargando = false;

          // Actualizar el evento en el calendario
          this.citaSeleccionada.evento.setDates(
            fechaHoraCompleta,
            new Date(fechaHoraCompleta.getTime() + 60 * 60 * 1000) // +1 hora
          );
          this.citaSeleccionada.evento.setExtendedProp(
            'citaOriginal',
            citaActualizada
          );

          this.mostrarMensajeExito(
            `Cita reprogramada para ${this.formatearFechaHumana(
              fechaHoraCompleta
            )} a las ${this.formatearHoraHumana(fechaHoraCompleta)}`
          );

          this.limpiarVariablesModal();
          this.recargarCalendario();
        },
        error: (err) => {
          this.reprogCargando = false;
          this.error =
            'Error al reprogramar la cita. Verifica la disponibilidad.';
          console.error('Error updating cita:', err);

          // Revertir la operación
          if (this.tipoOperacion === 'drop' && this.dropInfoBackup) {
            this.dropInfoBackup.revert();
          } else if (this.tipoOperacion === 'resize' && this.resizeInfoBackup) {
            this.resizeInfoBackup.revert();
          }

          this.limpiarVariablesModal();
        },
      });
  }

  // Cerrar modal sin seleccionar hora
  cerrarModal(): void {
    // Revertir la operación si se cierra el modal
    if (this.tipoOperacion === 'drop' && this.dropInfoBackup) {
      this.dropInfoBackup.revert();
    } else if (this.tipoOperacion === 'resize' && this.resizeInfoBackup) {
      this.resizeInfoBackup.revert();
    }

    this.limpiarVariablesModal();
  }

  // Limpiar variables del modal
  limpiarVariablesModal(): void {
    this.mostrarModalHoras = false;
    this.horasDisponibles = [];
    this.fechaSeleccionada = '';
    this.medicoEspecialidadId = null;
    this.citaSeleccionada = null;
    this.tipoOperacion = null;
    this.dropInfoBackup = null;
    this.resizeInfoBackup = null;
    this.cdRef.detectChanges();
  }

  // Método auxiliar para formatear fecha en el modal
  getFechaFormateada(): string {
    if (!this.fechaSeleccionada) return '';
    return this.formatearFechaHumana(new Date(this.fechaSeleccionada));
  }

  // Crear nueva cita
  crearNuevaCita(): void {
    this.router.navigate(['citas/crear']);
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const evento = clickInfo.event;
    const extendedProps = evento.extendedProps;
    const citaOriginal: Cita = extendedProps['citaOriginal'];

    const mensaje = `
      Paciente: ${extendedProps['paciente']}
      Médico: ${extendedProps['medico']}
      Especialidad: ${extendedProps['especialidad']}
      Estado: ${extendedProps['estado']}
      Motivo: ${extendedProps['motivo']}
      ${extendedProps['notas'] ? `Notas: ${extendedProps['notas']}` : ''}
    `.trim();

    if (confirm(`${mensaje}\n\n¿Deseas ver los detalles de esta cita?`)) {
      this.router.navigate(['/citas/editar', evento.id]);
    }
  }

  // Utilidades de formato
  formatearFechaParaAPI(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  formatearHoraParaAPI(fecha: Date): string {
    return fecha.toTimeString().split(' ')[0];
  }

  formatearFechaHumana(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES');
  }

  formatearHoraHumana(fecha: Date): string {
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getColorPorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      pendiente: '#ffc107',
      confirmada: '#198754',
      cancelada: '#dc3545',
      realizada: '#6c757d',
    };
    return colores[estado] || '#3788d8';
  }

  mostrarMensajeExito(mensaje: string): void {
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success alert-dismissible fade show';
    alerta.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alerta.style.position = 'fixed';
    alerta.style.top = '20px';
    alerta.style.right = '20px';
    alerta.style.zIndex = '9999';
    alerta.style.minWidth = '300px';

    document.body.appendChild(alerta);

    setTimeout(() => {
      if (document.body.contains(alerta)) {
        document.body.removeChild(alerta);
      }
    }, 3000);
  }

  volverALista(): void {
    this.router.navigate(['/citas']);
  }

  recargarCalendario(): void {
    this.cargarCitasParaCalendario();
  }
}
