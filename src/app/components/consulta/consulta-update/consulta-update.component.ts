import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultaService } from '../../../services/consulta/consulta.service';
import { Consulta } from '../../../models/consulta/consulta.model';

@Component({
  selector: 'app-consulta-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-update.component.html'
})
export class ConsultaUpdateComponent implements OnInit {
  consultaId!: number;
  consulta: Consulta = {
    motivo_consulta: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    peso: undefined,
    altura: undefined,
    presion_arterial: '',
    temperatura: undefined,
    frecuencia_cardiaca: undefined,
    frecuencia_respiratoria: undefined,
    saturacion_oxigeno: undefined,
    prescripciones: '',
    examenes_solicitados: '',
    proxima_cita: '',
    notas_privadas: ''
  };

  guardando = false;
  cargando = false;
  error?: string;
  mensaje?: string;
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private srv: ConsultaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargando = true;
    this.consultaId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.consultaId) {
      this.error = 'ID de consulta inválido.';
      return;
    }

    this.srv.getConsulta(this.consultaId).subscribe({
      next: (data) => {
        this.consulta = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando consulta:', err);
        this.error = 'No se pudo cargar la consulta. Intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  guardar(f: NgForm): void {
    this.submitted = true;
    this.error = undefined;
    this.mensaje = undefined;

    if (this.guardando || this.cargando) return;

    if (f.invalid) {
      this.error = 'Por favor, complete todos los campos requeridos correctamente.';
      this.scrollToError();
      return;
    }

    if (!this.consulta.motivo_consulta?.trim()) {
      this.error = 'El motivo de la consulta es obligatorio.';
      this.scrollToError();
      return;
    }

    const dto = this.buildDto(this.consulta);
    this.guardando = true;

    this.srv.updateConsulta(this.consultaId, dto).subscribe({
      next: (res) => {
        this.guardando = false;
        this.mensaje = 'Consulta actualizada correctamente ✅';
        console.log('Consulta actualizada:', res);

        setTimeout(() => {
          this.router.navigate(['/consultas/lista']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al actualizar consulta:', err);
        this.error =
          this.extractBackendError(err) ||
          'No se pudo actualizar la consulta. Intente nuevamente.';
        this.guardando = false;
        this.scrollToError();
      }
    });
  }

  private buildDto(c: Consulta): any {
    const dto: any = { ...c };
    delete dto.id; // nunca enviamos el id dentro del cuerpo

    Object.keys(dto).forEach((k) => {
      const v = dto[k];
      if (v === undefined || v === null || v === '') delete dto[k];
    });

    console.log('DTO a enviar (update):', dto);
    return dto;
  }

  private scrollToError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  private extractBackendError(err: any): string {
    const e = err?.error;
    if (!e) return 'Error de conexión. Verifique su internet.';

    if (typeof e === 'string') return e;
    if (e.detail) return e.detail;

    if (typeof e === 'object') {
      const msgs: string[] = [];
      for (const k of Object.keys(e)) {
        const val = e[k];
        if (Array.isArray(val)) {
          msgs.push(`${k}: ${val.join(', ')}`);
        } else if (typeof val === 'string') {
          msgs.push(`${k}: ${val}`);
        }
      }
      return msgs.join(' | ') || 'Error desconocido del servidor.';
    }

    return 'Error inesperado. Por favor, contacte al administrador.';
  }

  /** 🔹 Botón “Volver” */
  volver(): void {
    this.router.navigate(['/consultas/lista']);
  }
}
