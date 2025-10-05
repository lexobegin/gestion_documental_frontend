import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EspecialidadCreate } from '../../../models/especialidad/especialidad.model';
import { EspecialidadService } from '../../../services/especialidad/especialidad.service';

@Component({
  selector: 'app-especialidad-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidad-create.component.html',
  styleUrl: './especialidad-create.component.scss',
})
export class EspecialidadCreateComponent {
  especialidad: EspecialidadCreate = {
    codigo: '',
    nombre: '',
    descripcion: '',
  };

  enviando: boolean = false;
  cargando: boolean = false;
  error: string | undefined;

  constructor(
    private especialidadService: EspecialidadService,
    private router: Router
  ) {}

  guardar(): void {
    if (this.enviando) return;

    this.enviando = true;
    this.error = undefined;

    this.especialidadService.createEspecialidad(this.especialidad).subscribe({
      next: (especialidadCreada) => {
        this.enviando = false;
        this.router.navigate(['/especialidades'], {
          queryParams: {
            mensaje: `Especialidad "${especialidadCreada.nombre}" creada exitosamente`,
            tipo: 'success',
          },
        });
      },
      error: (err) => {
        this.enviando = false;

        if (err.status === 400) {
          if (err.error?.codigo) {
            this.error = `El código "${this.especialidad.codigo}" ya existe`;
          } else if (err.error?.nombre) {
            this.error = `El nombre "${this.especialidad.nombre}" ya existe`;
          } else {
            this.error = 'Datos inválidos. Por favor verifica la información.';
          }
        } else {
          this.error = 'Error al crear la especialidad. Intenta nuevamente.';
        }

        console.error('Error creating especialidad:', err);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/especialidades']);
  }
}
