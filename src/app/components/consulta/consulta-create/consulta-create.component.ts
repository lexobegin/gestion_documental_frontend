import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConsultaService } from '../../../services/consulta/consulta.service';
import { ConsultaCreate } from '../../../models/consulta/consulta.model';

@Component({
  selector: 'app-consulta-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consulta-create.component.html'
})
export class ConsultaCreateComponent implements OnInit {
  consulta: ConsultaCreate = {
    paciente_email: '',
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
  error?: string;
  mensaje?: string;
  submitted = false;

  constructor(
    private srv: ConsultaService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  guardar(f: NgForm): void {
    this.submitted = true;
    this.error = undefined;
    this.mensaje = undefined;

    if (this.guardando) return;

    // 🔹 Validaciones básicas
    if (f.invalid) {
      this.error =
        'Por favor, complete todos los campos requeridos correctamente.';
      this.scrollToError();
      return;
    }

    // 🔹 Validar que se ingrese nombre o correo del paciente
    if (!this.consulta.paciente_email?.trim()) {
      this.error = 'Debe ingresar el nombre o correo del paciente.';
      this.scrollToError();
      return;
    }

    // 🔹 Validar datos generales antes de enviar
    const validacion = this.srv.validarConsulta(this.consulta);
    if (!validacion.isValid) {
      this.error = validacion.errors.join(' | ');
      this.scrollToError();
      return;
    }

    // 🔹 Preparar DTO limpio
    let dto = this.buildDto(this.consulta);

    // ✅ Detectar si el campo paciente_email en realidad es un nombre
    if (dto.paciente_email && !dto.paciente_email.includes('@')) {
      dto.paciente_nombre = dto.paciente_email.trim();
      delete dto.paciente_email; // eliminar el campo de email si no es un correo
    }

    this.guardando = true;

    this.srv.createConsulta(dto).subscribe({
      next: (res) => {
        this.guardando = false;
        this.mensaje = 'Consulta creada correctamente ✅';
        console.log('Consulta creada:', res);

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/consultas/lista']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al crear consulta:', err);
        this.error =
          this.extractBackendError(err) ||
          'No se pudo crear la consulta. Por favor, intente nuevamente.';
        this.guardando = false;
        this.scrollToError();
      }
    });
  }

  /** 🔹 Limpia y normaliza el payload */
  private buildDto(c: ConsultaCreate): any {
    const dto: any = { ...c };

    // Quitar espacios extra en paciente_email
    if (dto.paciente_email) {
      dto.paciente_email = dto.paciente_email.trim();
    }

    // Eliminar campos vacíos o nulos
    Object.keys(dto).forEach((k) => {
      const v = dto[k];
      if (v === undefined || v === null || v === '') delete dto[k];
    });

    console.log('DTO a enviar:', dto);
    return dto;
  }

  /** Desplaza la vista al primer campo con error */
  private scrollToError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  /** Intenta mostrar mensaje claro desde el backend */
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
}
