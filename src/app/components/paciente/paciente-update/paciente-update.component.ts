import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Paciente } from '../../../models/paciente/paciente.model';
import { PacienteService } from '../../../services/paciente/paciente.service';

@Component({
  selector: 'app-paciente-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paciente-update.component.html',
})
export class PacienteUpdateComponent implements OnInit {
  paciente: Paciente = {
    // ✅ CAMPOS NUEVOS REQUERIDOS
    nombre: '',
    apellido: '',
    password: '', // Vacío en update
    
    // ✅ CAMPOS EXISTENTES
    nombre_completo: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: 'M',
    direccion: '',
    tipo_sangre: '',
    alergias: '',
    enfermedades_cronicas: '',
    medicamentos_actuales: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_parentesco: '',
    estado: 'Activo'
  };

  guardando = false;
  error?: string;
  mensaje?: string;
  submitted = false;
  cargando = true;

  get fechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  constructor(
    private srv: PacienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarPaciente(Number(id));
    }
  }

  cargarPaciente(id: number): void {
    this.cargando = true;
    this.srv.obtener(id).subscribe({
      next: (paciente) => {
        this.paciente = paciente;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el paciente.';
        this.cargando = false;
      }
    });
  }

  actualizarNombreCompleto(): void {
    this.paciente.nombre_completo = `${this.paciente.nombre} ${this.paciente.apellido}`.trim();
  }

  onNombreChange(): void {
    this.actualizarNombreCompleto();
  }

  onApellidoChange(): void {
    this.actualizarNombreCompleto();
  }

  guardar(f: NgForm): void {
    this.submitted = true;
    this.error = undefined;
    this.mensaje = undefined;

    if (this.guardando) return;

    if (f.invalid) {
      this.error = 'Complete todos los campos requeridos.';
      this.scrollToError();
      return;
    }

    if (!this.isValidEmail(this.paciente.email)) {
      this.error = 'Ingrese un email válido.';
      this.scrollToError();
      return;
    }

    if (!this.paciente.fecha_nacimiento) {
      this.error = 'La fecha de nacimiento es requerida.';
      this.scrollToError();
      return;
    }

    if (!this.paciente.nombre || this.paciente.nombre.trim().length < 2) {
      this.error = 'El nombre debe tener al menos 2 caracteres.';
      this.scrollToError();
      return;
    }

    if (!this.paciente.apellido || this.paciente.apellido.trim().length < 2) {
      this.error = 'El apellido debe tener al menos 2 caracteres.';
      this.scrollToError();
      return;
    }

    const dto = this.buildDto();
    this.guardando = true;

    this.srv.actualizar(this.paciente.id!, dto).subscribe({
      next: (pacienteActualizado) => {
        this.guardando = false;
        this.mensaje = `Paciente "${this.paciente.nombre_completo}" actualizado exitosamente.`;
        setTimeout(() => this.router.navigate(['/pacientes']), 2000);
      },
      error: (err) => {
        this.guardando = false;
        this.error = this.extractBackendError(err) || 'No se pudo actualizar el paciente.';
        this.scrollToError();
      },
    });
  }

  private buildDto(): any {
    this.actualizarNombreCompleto();
    
    const dto: any = {
      nombre: this.paciente.nombre.trim(),
      apellido: this.paciente.apellido.trim(),
      email: this.paciente.email.trim().toLowerCase(),
      telefono: this.paciente.telefono?.trim() || '',
      direccion: this.paciente.direccion?.trim() || '',
      fecha_nacimiento: this.paciente.fecha_nacimiento,
      genero: this.paciente.genero,
      tipo_sangre: this.paciente.tipo_sangre?.trim(),
      alergias: this.paciente.alergias?.trim(),
      enfermedades_cronicas: this.paciente.enfermedades_cronicas?.trim(),
      medicamentos_actuales: this.paciente.medicamentos_actuales?.trim(),
      contacto_emergencia_nombre: this.paciente.contacto_emergencia_nombre?.trim(),
      contacto_emergencia_telefono: this.paciente.contacto_emergencia_telefono?.trim(),
      contacto_emergencia_parentesco: this.paciente.contacto_emergencia_parentesco?.trim(),
      estado: this.paciente.estado
    };

    // Solo incluir password si no está vacío (para actualización)
    if (this.paciente.password && this.paciente.password.trim().length >= 6) {
      dto.password = this.paciente.password;
    }

    Object.keys(dto).forEach((k) => {
      const v = dto[k];
      if (v === undefined || v === '' || v === null) delete dto[k];
    });

    return dto;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private scrollToError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.is-invalid');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  private extractBackendError(err: any): string {
    const e = err?.error;
    if (!e) return 'Error de conexión.';
    if (typeof e === 'string') return e;
    if (e.detail) return e.detail;
    
    if (typeof e === 'object') {
      const msgs: string[] = [];
      for (const k of Object.keys(e)) {
        const val = e[k];
        if (Array.isArray(val)) msgs.push(`${k}: ${val.join(', ')}`);
        else if (typeof val === 'string') msgs.push(`${k}: ${val}`);
      }
      return msgs.join(' | ');
    }
    
    return 'Error inesperado.';
  }
}