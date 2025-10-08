import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cita, CitaUpdate } from '../../../models/cita/cita.model';
import { CitaService } from '../../../services/cita/cita.service';

@Component({
  selector: 'app-cita-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cita-update.component.html',
  styleUrl: './cita-update.component.scss',
})
export class CitaUpdateComponent implements OnInit {
  cita: Cita | null = null;

  enviando: boolean = false;
  cargando: boolean = false;
  error: string | undefined;

  fechaMinima: string;
  private citaId!: number;

  constructor(
    private citaService: CitaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.citaId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.citaId) {
      this.cargarCita();
    } else {
      this.error = 'ID de cita no válido';
    }
  }

  cargarCita(): void {
    this.cargando = true;
    this.error = undefined;

    this.citaService.getCitaById(this.citaId).subscribe({
      next: (cita) => {
        this.cita = cita;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la cita';
        this.cargando = false;
        console.error('Error loading cita:', err);
      },
    });
  }

  guardar(): void {
    if (!this.cita || this.enviando) return;

    this.enviando = true;
    this.error = undefined;

    const datosActualizacion: CitaUpdate = {
      fecha_cita: this.cita.fecha_cita,
      hora_cita: this.cita.hora_cita,
      estado: this.cita.estado,
      motivo: this.cita.motivo,
      notas: this.cita.notas,
    };

    this.citaService.updateCita(this.citaId, datosActualizacion).subscribe({
      next: (citaActualizada) => {
        this.enviando = false;
        this.router.navigate(['/citas'], {
          queryParams: {
            mensaje: `Cita actualizada exitosamente`,
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
        } else if (err.status === 404) {
          this.error = 'La cita no fue encontrada';
        } else {
          this.error = 'Error al actualizar la cita. Intenta nuevamente.';
        }

        console.error('Error updating cita:', err);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/citas']);
  }

  volverALista(): void {
    this.router.navigate(['/citas']);
  }

  // Utilidades
  formatearFechaHora(fechaHora: string): string {
    return new Date(fechaHora).toLocaleString('es-ES');
  }
}
