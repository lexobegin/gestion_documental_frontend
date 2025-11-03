import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ConsultaService } from '../../../services/consulta/consulta.service';
import { ExamenMedicoService, ExamenMedico } from '../../../services/examen/examen-medico.service';
import { Consulta } from '../../../models/consulta/consulta.model';

interface ToastMsg {
  mensaje: string;
  tipo: 'success' | 'error';
  mostrar: boolean;
}

@Component({
  selector: 'app-consulta-examenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-examenes.component.html',
})
export class ConsultaExamenesComponent implements OnInit {
  consulta!: Consulta;
  examenes: ExamenMedico[] = [];
  tiposExamen: any[] = [];
  urgenciasDisponibles = ['Normal', 'Urgente', 'Rutina'];
  cargando = true;

  mostrarModalEliminar = false;
  tipoEliminacion: 'tipo' | 'solicitud' | null = null;
  elementoSeleccionado: any = null;

  toasts: ToastMsg[] = [];

  nuevo = {
    tipo_examen: null as number | null,
    urgencia: 'Normal',
    indicaciones_especificas: ''
  };

  nuevoTipo = {
    codigo: '',
    nombre: '',
    descripcion: '',
    indicaciones: '',
    urgencia_default: 'Rutina'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private srvConsulta: ConsultaService,
    private srvExamen: ExamenMedicoService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.srvConsulta.getConsultaById(id).subscribe({
      next: (c) => {
        this.consulta = c;
        this.cargarTipos();
        this.cargarExamenes();
      },
      error: () => (this.cargando = false),
    });
  }

  cargarTipos(): void {
    this.srvExamen.getTiposExamenSelect().subscribe({
      next: (data: any) => (this.tiposExamen = data),
      error: (err) => console.error('Error al cargar tipos:', err),
    });
  }

  cargarExamenes(): void {
    if (!this.consulta?.id) return;
    this.srvExamen.getExamenesPorConsulta(this.consulta.id).subscribe({
      next: (data: any) => {
        this.examenes = data;
        this.cargando = false;
      },
      error: () => (this.cargando = false),
    });
  }

  crearTipoExamen(): void {
    if (!this.nuevoTipo.nombre.trim() || !this.nuevoTipo.codigo.trim()) {
      this.mostrarToast('Completa el código y nombre del examen.', 'error');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      'Content-Type': 'application/json',
    });

    this.http.post(`${environment.apiUrl}/tipos-examen/`, this.nuevoTipo, { headers }).subscribe({
      next: () => {
        this.mostrarToast('Tipo de examen creado correctamente ✅', 'success');
        this.nuevoTipo = { codigo: '', nombre: '', descripcion: '', indicaciones: '', urgencia_default: 'Rutina' };
        this.cargarTipos();
      },
      error: () => this.mostrarToast('Error al crear tipo de examen ❌', 'error'),
    });
  }

  crearExamen(): void {
    if (!this.nuevo.tipo_examen) {
      this.mostrarToast('Selecciona un tipo de examen.', 'error');
      return;
    }

    const payload = {
      consulta: this.consulta.id,
      paciente: (this.consulta as any).paciente || (this.consulta as any).historia_clinica?.paciente,
      medico: this.consulta.medico,
      tipo_examen: Number(this.nuevo.tipo_examen),
      urgencia: this.nuevo.urgencia,
      indicaciones_especificas: this.nuevo.indicaciones_especificas
    };

    this.srvExamen.crearExamen(payload).subscribe({
      next: () => {
        this.mostrarToast('Examen solicitado correctamente ✅', 'success');
        this.nuevo = { tipo_examen: null, urgencia: 'Normal', indicaciones_especificas: '' };
        this.cargarExamenes();
      },
      error: () => this.mostrarToast('Error al solicitar examen ❌', 'error'),
    });
  }

  confirmarEliminar(elemento: any, tipo: 'tipo' | 'solicitud'): void {
    this.elementoSeleccionado = elemento;
    this.tipoEliminacion = tipo;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.elementoSeleccionado = null;
    this.tipoEliminacion = null;
  }

  eliminar(): void {
    if (!this.elementoSeleccionado || !this.tipoEliminacion) return;

    const id = this.elementoSeleccionado.id;
    this.mostrarModalEliminar = false;

    if (this.tipoEliminacion === 'tipo') {
      this.srvExamen.eliminarTipoExamen(id).subscribe({
        next: () => {
          this.mostrarToast('Tipo de examen eliminado 🗑️', 'success');
          this.cargarTipos();
        },
        error: () => this.mostrarToast('Error al eliminar tipo de examen ❌', 'error'),
      });
    } else if (this.tipoEliminacion === 'solicitud') {
      this.srvExamen.eliminarSolicitudExamen(id).subscribe({
        next: () => {
          this.mostrarToast('Solicitud de examen eliminada 🗑️', 'success');
          this.cargarExamenes();
        },
        error: () => this.mostrarToast('Error al eliminar solicitud ❌', 'error'),
      });
    }
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error'): void {
    const t: ToastMsg = { mensaje, tipo, mostrar: true };
    this.toasts.push(t);
    setTimeout(() => (t.mostrar = false), 4000);
  }

  volver(): void {
    this.router.navigate(['/consultas/lista']);
  }
}
