import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Especialidad,
  EspecialidadUpdate,
} from '../../../models/especialidad/especialidad.model';
import { EspecialidadService } from '../../../services/especialidad/especialidad.service';

@Component({
  selector: 'app-especialidad-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidad-update.component.html',
  styleUrl: './especialidad-update.component.scss',
})
export class EspecialidadUpdateComponent implements OnInit {
  especialidad: Especialidad | null = null;
  fechaCreacion: Date = new Date();

  enviando: boolean = false;
  cargando: boolean = false;
  error: string | undefined;

  private especialidadId!: number;

  constructor(
    private especialidadService: EspecialidadService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.especialidadId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.especialidadId) {
      this.cargarEspecialidad();
    } else {
      this.error = 'ID de especialidad no válido';
    }
  }

  cargarEspecialidad(): void {
    this.cargando = true;
    this.error = undefined;

    this.especialidadService
      .getEspecialidadById(this.especialidadId)
      .subscribe({
        next: (especialidad) => {
          this.especialidad = especialidad;
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al cargar la especialidad';
          this.cargando = false;
          console.error('Error loading especialidad:', err);
        },
      });
  }

  guardar(): void {
    if (!this.especialidad || this.enviando) return;

    this.enviando = true;
    this.error = undefined;

    const datosActualizacion: EspecialidadUpdate = {
      codigo: this.especialidad.codigo,
      nombre: this.especialidad.nombre,
      descripcion: this.especialidad.descripcion,
    };

    this.especialidadService
      .updateEspecialidad(this.especialidadId, datosActualizacion)
      .subscribe({
        next: (especialidadActualizada) => {
          this.enviando = false;
          this.router.navigate(['/especialidades'], {
            queryParams: {
              mensaje: `Especialidad "${especialidadActualizada.nombre}" actualizada exitosamente`,
              tipo: 'success',
            },
          });
        },
        error: (err) => {
          this.enviando = false;

          if (err.status === 400) {
            if (err.error?.codigo) {
              this.error = `El código "${this.especialidad!.codigo}" ya existe`;
            } else if (err.error?.nombre) {
              this.error = `El nombre "${this.especialidad!.nombre}" ya existe`;
            } else {
              this.error =
                'Datos inválidos. Por favor verifica la información.';
            }
          } else if (err.status === 404) {
            this.error = 'La especialidad no fue encontrada';
          } else {
            this.error =
              'Error al actualizar la especialidad. Intenta nuevamente.';
          }

          console.error('Error updating especialidad:', err);
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/especialidades']);
  }

  volverALista(): void {
    this.router.navigate(['/especialidades']);
  }
}
