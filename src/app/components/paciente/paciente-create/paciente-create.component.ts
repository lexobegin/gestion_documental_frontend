import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Paciente } from '../../../models/paciente/paciente.model';
import { PacienteService } from '../../../services/paciente/paciente.service';

@Component({
  selector: 'app-paciente-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paciente-create.component.html',
})
export class PacienteCreateComponent {
  paciente: Paciente = {
    nombre: '',
    apellido: '',
    password: 'TempPassword123!',
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
    estado: 'Activo' // ✅ VOLVEMOS A 'Activo'
  };

  guardando = false;
  error?: string;
  mensaje?: string;
  submitted = false;
  mostrarPassword = false;

  get fechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  constructor(
    private srv: PacienteService,
    private router: Router
  ) {}

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

    if (!this.paciente.password || this.paciente.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
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
    
    // ✅ DEBUG
    console.log('🔍 DTO COMPLETO a enviar:', JSON.stringify(dto, null, 2));
    console.log('📤 URL de destino:', '/api/pacientes/');

    this.guardando = true;
    this.srv.crear(dto).subscribe({
      next: (pacienteCreado) => {
        this.guardando = false;
        this.mensaje = `Paciente "${this.paciente.nombre_completo}" creado exitosamente.`;
        setTimeout(() => {
          this.router.navigate(['/pacientes']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al crear paciente:', err);
        this.error = this.extractBackendError(err) || 'No se pudo crear el paciente.';
        this.guardando = false;
        this.scrollToError();
      },
    });
  }

private buildDto(): any {
  const dto: any = {
    // ✅ CAMPOS EXACTOS para PacienteCreateSerializer
    email: this.paciente.email.trim().toLowerCase(),
    password: this.paciente.password,
    nombre: this.paciente.nombre.trim(),
    apellido: this.paciente.apellido.trim(),
    telefono: this.paciente.telefono?.trim() || '',
    direccion: this.paciente.direccion?.trim() || '',
    fecha_nacimiento: this.paciente.fecha_nacimiento,
    genero: this.paciente.genero,
    
    // Campos de paciente
    tipo_sangre: this.paciente.tipo_sangre?.trim() || '',
    alergias: this.paciente.alergias?.trim() || '',
    enfermedades_cronicas: this.paciente.enfermedades_cronicas?.trim() || '',
    medicamentos_actuales: this.paciente.medicamentos_actuales?.trim() || '',
    contacto_emergencia_nombre: this.paciente.contacto_emergencia_nombre?.trim() || '',
    contacto_emergencia_telefono: this.paciente.contacto_emergencia_telefono?.trim() || '',
    contacto_emergencia_parentesco: this.paciente.contacto_emergencia_parentesco?.trim() || '',
    estado: 'Activo'  // ✅ FIJO: 'Activo' porque el backend lo espera así
  };

  return dto;
}
  generarPassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.paciente.password = password;
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
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