import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecetasService } from '../../../services/recetas/recetas.service';

@Component({
  selector: 'app-receta-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-create.component.html',
})
export class RecetaCreateComponent implements OnInit {

  consultasDisponibles: any[] = [];

  // Datos de la nueva receta
  nuevaReceta = {
    consulta: null as number | null,   // EL ÚNICO CAMPO QUE USA EL BACKEND
    observaciones: '',                // EL OTRO CAMPO QUE USA EL BACKEND

    // CAMPOS VISUALES (no se envían al backend en la receta)
    paciente: '',
    detalles: [] as any[],            // Se enviarán al endpoint /detalles-receta/
  };

  constructor(
    private router: Router,
    private recetasService: RecetasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConsultasDisponibles();
  }

  cargarConsultasDisponibles(): void {
    this.recetasService.obtenerConsultas().subscribe({
      next: (data) => {
        this.consultasDisponibles = data.results ? data.results : data;
      },
      error: (err) => console.error('❌ Error al cargar consultas:', err),
    });
  }

  // Agregar medicamento visualmente
  agregarMedicamento(): void {
    this.nuevaReceta.detalles.push({
      medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      indicaciones: '',
    });
    this.cdr.detectChanges();
  }

  eliminarMedicamento(index: number): void {
    this.nuevaReceta.detalles.splice(index, 1);
  }

  actualizarPaciente(): void {
    const consulta = this.consultasDisponibles.find(
      (c) => c.id === Number(this.nuevaReceta.consulta)
    );
    this.nuevaReceta.paciente = consulta ? consulta.paciente : '';
  }

  guardarReceta(): void {
    if (!this.nuevaReceta.consulta) {
      alert('⚠️ Seleccione una consulta.');
      return;
    }

    // PAYLOAD REAL QUE ACEPTA EL BACKEND
    const recetaPayload = {
      consulta: Number(this.nuevaReceta.consulta),
      observaciones: this.nuevaReceta.observaciones,
    };

    console.log('🔵 Enviando receta:', recetaPayload);

    // 1️⃣ Guardar receta primero
    this.recetasService.createReceta(recetaPayload).subscribe({
      next: (recetaCreada) => {
        console.log('🟢 Receta creada:', recetaCreada);

        const recetaId = recetaCreada.id;

        // 2️⃣ Guardar cada detalle (medicamento)
        this.nuevaReceta.detalles.forEach((d) => {
          const detallePayload = {
            receta: recetaId,
            medicamento: d.medicamento,
            dosis: d.dosis,
            frecuencia: d.frecuencia,
            duracion: d.duracion,
            indicaciones: d.indicaciones,
          };

          console.log('🟡 Guardando detalle:', detallePayload);

          this.recetasService.createDetalle(detallePayload).subscribe({
            error: (err) =>
              console.error(' Error guardando detalle:', err),
          });
        });

        alert('✅ Receta registrada correctamente');
        this.router.navigate(['/recetas']);
      },

      error: (err) => {
        console.error('Error al guardar receta:', err);
        alert('Error al guardar receta.');
      },
    });
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '';
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES');
  }

  volver(): void {
    this.router.navigate(['/recetas']);
  }
}
