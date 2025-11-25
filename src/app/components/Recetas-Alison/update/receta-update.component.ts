import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecetasService } from '../../../services/recetas/recetas.service';

@Component({
  selector: 'app-receta-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-update.component.html',
})
export class RecetaUpdateComponent implements OnInit {

  receta: any = null;
  recetaId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recetasService: RecetasService
  ) {}

  ngOnInit(): void {
    this.recetaId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarReceta();
  }

  // ===========================
  //   1. CARGAR RECETA REAL
  // ===========================
  cargarReceta(): void {
    this.recetasService.getReceta(this.recetaId).subscribe({
      next: (data) => {
        console.log("🔵 Receta cargada:", data);
        this.receta = data;
      },
      error: (err) => {
        alert("❌ Error al cargar receta");
        console.error(err);
        this.router.navigate(['/recetas']);
      },
    });
  }

  // ===========================
  //   MANEJO DE MEDICAMENTOS
  // ===========================
  agregarMedicamento(): void {
    this.receta.detalles.push({
      id: null,  // si es nuevo
      medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      indicaciones: '',
      _nuevo: true
    });
  }

  eliminarMedicamento(index: number): void {
    const det = this.receta.detalles[index];

    if (det.id) {
      // si existe en BD → eliminar en backend
      this.recetasService.deleteDetalle(det.id).subscribe({
        next: () => console.log("🗑️ Detalle eliminado"),
        error: (err) => console.error("❌ Error eliminando", err)
      });
    }

    this.receta.detalles.splice(index, 1);
  }

  // ===========================
  //   GUARDAR CAMBIOS
  // ===========================
  guardarCambios(): void {
    const payload = {
      consulta: this.receta.consulta,
      observaciones: this.receta.observaciones
    };

    // 1️⃣ Actualizar datos generales de la receta
    this.recetasService.updateReceta(this.recetaId, payload).subscribe({
      next: () => {
        console.log("🟢 Receta actualizada.");

        // 2️⃣ Actualizar / crear medicamentos
        this.receta.detalles.forEach((d: any) => {
          const detPayload = {
            receta: this.recetaId,
            medicamento: d.medicamento,
            dosis: d.dosis,
            frecuencia: d.frecuencia,
            duracion: d.duracion,
            indicaciones: d.indicaciones
          };

          if (d.id && !d._nuevo) {
            // actualizar detalle existente
            this.recetasService.updateDetalle(d.id, detPayload).subscribe();
          } else if (d._nuevo) {
            // crear detalle nuevo
            this.recetasService.createDetalle(detPayload).subscribe();
          }
        });

        alert("✅ Receta actualizada correctamente");
        this.router.navigate(['/recetas']);
      },

      error: (err) => {
        console.error("❌ Error al actualizar receta:", err);
        alert("Error al actualizar");
      }
    });
  }

  volver(): void {
    this.router.navigate(['/recetas']);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '';
    return new Date(fecha + "T00:00:00").toLocaleDateString('es-ES');
  }
}
