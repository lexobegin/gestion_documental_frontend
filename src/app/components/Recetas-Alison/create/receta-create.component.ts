import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecetasService } from '../../../services/recetas/recetas.service';
import { Receta } from '../../../models/recetas/receta.model';

@Component({
  selector: 'app-receta-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-create.component.html',
})
export class RecetaCreateComponent implements OnInit {
  consultasDisponibles: any[] = [];

  nuevaReceta = {
    id_consulta: '',
    paciente: '',
    diagnostico: '',
    observaciones: '',
    firmaDigital: null as File | null,
    detalles: [] as any[],
  };

  constructor(
    private router: Router,
    private recetasService: RecetasService,
    private cdr: ChangeDetectorRef // 🔹 NUEVO
  ) {}

  ngOnInit(): void {
    this.cargarConsultasDisponibles();
  }

  cargarConsultasDisponibles(): void {
    this.recetasService.obtenerConsultas().subscribe({
      next: (data) => {
        this.consultasDisponibles = data.results ? data.results : data;
      },
      error: (err) => console.error('Error al cargar consultas:', err),
    });
  }

  agregarMedicamento(): void {
    this.nuevaReceta.detalles.push({
      nombre_medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      indicaciones: '',
    });

    console.log('Medicamento agregado:', this.nuevaReceta.detalles);
    this.cdr.detectChanges(); // 🔹 FORZAR REFRESCO VISUAL
  }

  eliminarMedicamento(index: number): void {
    this.nuevaReceta.detalles.splice(index, 1);
  }

  actualizarPaciente(): void {
    const consultaId = Number(this.nuevaReceta.id_consulta);
    const consulta = this.consultasDisponibles.find((c) => c.id === consultaId);
    this.nuevaReceta.paciente = consulta ? consulta.paciente : '';
  }

  onFileSelected(event: any): void {
    this.nuevaReceta.firmaDigital = event.target.files[0];
  }

  guardarReceta(): void {
    if (!this.nuevaReceta.id_consulta) return alert('⚠️ Seleccione una consulta.');
    if (!this.nuevaReceta.diagnostico.trim()) return alert('⚠️ Diagnóstico obligatorio.');
    if (this.nuevaReceta.detalles.length === 0) return alert('⚠️ Agregue medicamentos.');

    const camposIncompletos = this.nuevaReceta.detalles.some(
      (d) =>
        !d.nombre_medicamento.trim() ||
        !d.dosis.trim() ||
        !d.frecuencia.trim() ||
        !d.duracion.trim()
    );

    if (camposIncompletos) {
      alert('⚠️ Complete todos los campos del medicamento.');
      return;
    }

    const recetaPayload: Receta = {
      ...(this.nuevaReceta as any),
      id: 0,
      fecha_receta: new Date().toISOString(),
      medico: '',
    };

    this.recetasService.createReceta(recetaPayload).subscribe({
      next: (res) => {
        alert('✅ Receta registrada correctamente');
        this.router.navigate(['/recetas']);
      },
      error: (err) => {
        console.error('❌ Error al guardar receta:', err);
        alert('Error al guardar en el servidor.');
      },
    });
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '';
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  volver(): void {
    this.router.navigate(['/recetas']);
  }
}