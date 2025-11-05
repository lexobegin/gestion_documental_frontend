import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecetasService } from '../../../services/recetas/recetas.service';
import { Receta } from '../../../models/recetas/receta.model';

@Component({
  selector: 'app-receta-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-update.component.html',
})
export class RecetaUpdateComponent implements OnInit {
  consultasDisponibles = [
    { id: 15, paciente: 'Carlos López', especialidad: 'Cardiología', fecha: '2025-10-23' },
    { id: 2, paciente: 'Ana Rodríguez', especialidad: 'Neurología', fecha: '2025-10-22' },
  ];

  recetas = [
    {
      id: 1,
      id_consulta: 15,
      paciente: 'Carlos López',
      diagnostico: 'Hipertensión arterial',
      observaciones: 'Control de presión arterial y dieta balanceada.',
      firmaDigital: null,
      detalles: [
        { nombre_medicamento: 'Losartán 50mg', dosis: '1 tableta', frecuencia: 'Cada 12 horas', duracion: '30 días', indicaciones: 'Tomar después de las comidas' },
        { nombre_medicamento: 'Aspirina 100mg', dosis: '1 tableta', frecuencia: 'Cada 24 horas', duracion: '30 días', indicaciones: 'Tomar por las mañanas' }
      ]
    }
  ];

  receta: any = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.receta = this.recetas.find(r => r.id === id);

    if (!this.receta) {
      alert('⚠️ No se encontró la receta.');
      this.router.navigate(['/recetas']);
    }
  }

  agregarMedicamento(): void {
    this.receta.detalles.push({
      nombre_medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      indicaciones: '',
    });
  }

  eliminarMedicamento(index: number): void {
    this.receta.detalles.splice(index, 1);
  }

  onFileSelected(event: any): void {
    this.receta.firmaDigital = event.target.files[0];
  }

  guardarCambios(): void {
    // === VALIDACIONES ===
    if (!this.receta.id_consulta) {
      alert('⚠️ Debe seleccionar una consulta médica.');
      return;
    }

    if (!this.receta.diagnostico.trim()) {
      alert('⚠️ Debe ingresar un diagnóstico.');
      return;
    }

    if (this.receta.detalles.length === 0) {
      alert('⚠️ Debe agregar al menos un medicamento.');
      return;
    }

    const camposIncompletos = this.receta.detalles.some((det: any) =>
      !det.nombre_medicamento.trim() ||
      !det.dosis.trim() ||
      !det.frecuencia.trim() ||
      !det.duracion.trim()
    );

    if (camposIncompletos) {
      alert('⚠️ Todos los campos de los medicamentos son obligatorios.');
      return;
    }

    // Firma no es obligatoria al editar, pero si se quiere actualizar:
    if (this.receta.firmaDigital && !(this.receta.firmaDigital instanceof File)) {
      alert('⚠️ La firma digital debe ser un archivo válido.');
      return;
    }

    // === SI TODO ESTÁ OK ===
    alert('✅ Cambios guardados correctamente.');
    console.log('Receta actualizada:', this.receta);
    this.router.navigate(['/recetas']);
  }

  volver(): void {
    this.router.navigate(['/recetas']);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '';
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}