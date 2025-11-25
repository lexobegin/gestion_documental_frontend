import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConsultaService } from '../../../services/consulta/consulta.service';
import { RecetaService } from '../../../services/recetas/recetas.service';

import { Consulta } from '../../../models/consulta/consulta.model';
import { Receta, RecetaCreate } from '../../../models/recetas/receta.model';
import {
  DetalleReceta,
  DetalleRecetaCreate
} from '../../../models/recetas/detalle-receta.model';

interface ToastMsg {
  mensaje: string;
  tipo: 'success' | 'error';
  mostrar: boolean;
}

@Component({
  selector: 'app-consulta-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-recetas.component.html'
})
export class ConsultaRecetasComponent implements OnInit {

  consulta!: Consulta;
  recetas: Receta[] = [];
  detalles: DetalleReceta[] = [];

  cargando = true;
  recetaSeleccionada: Receta | null = null;

  // Nueva receta
  nuevaReceta: RecetaCreate = {
    consulta: 0,
    fecha_receta: '',
    observaciones: ''
  };

  nuevoDetalle: DetalleRecetaCreate = {
    receta: 0,
    medicamento: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    indicaciones: ''
  };

  medicamentosTemp: DetalleRecetaCreate[] = [];

  // Filtros
  filterDate: string = '';
  filterObservations: string = '';

  // Modal eliminar
  mostrarModalEliminar = false;
  tipoEliminacion: 'receta' | 'detalle' | null = null;
  elementoSeleccionado: any = null;

  // Toasts
  toasts: ToastMsg[] = [];

  // Edición
  modalEditarAbierto = false;
  recetaEditando: Receta | null = null;
  editFecha = '';
  editObservaciones = '';
  editMedicamentos: DetalleRecetaCreate[] = [];

  editNuevoMed: DetalleRecetaCreate = {
    receta: 0,
    medicamento: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    indicaciones: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private srvConsulta: ConsultaService,
    private srvReceta: RecetaService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.srvConsulta.getConsultaById(id).subscribe({
      next: consulta => {
        this.consulta = consulta;
        this.nuevaReceta.consulta = consulta.id;
        this.cargarRecetas();
      },
      error: () => {
        this.cargando = false;
        this.mostrarToast('Error al cargar la consulta', 'error');
      }
    });
  }

  cargarRecetas(): void {
    this.cargando = true;

    this.srvReceta.getRecetasPorConsulta(this.consulta.id).subscribe({
      next: data => {
        this.recetas = data.results ?? data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mostrarToast('Error al cargar recetas', 'error');
      }
    });
  }

  // Filtrar recetas
  get filteredPrescriptions(): Receta[] {
    return this.recetas.filter(r => {
      const matchesDate = !this.filterDate || r.fecha_receta.includes(this.filterDate);
      const matchesObs = !this.filterObservations || 
        (r.observaciones || '').toLowerCase().includes(this.filterObservations.toLowerCase());
      return matchesDate && matchesObs;
    });
  }

  // ==================== CREAR RECETA ====================
  agregarMedicamentoTemp(): void {
    if (!this.nuevoDetalle.medicamento.trim()) {
      this.mostrarToast('Debe ingresar el nombre del medicamento', 'error');
      return;
    }

    this.medicamentosTemp.push({ ...this.nuevoDetalle });

    this.nuevoDetalle = {
      receta: 0,
      medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      indicaciones: ''
    };

    this.mostrarToast('Medicamento agregado', 'success');
  }

  eliminarMedicamentoTemp(i: number): void {
    this.medicamentosTemp.splice(i, 1);
    this.mostrarToast('Medicamento eliminado', 'success');
  }

  guardarRecetaCompleta(): void {
    if (!this.nuevaReceta.fecha_receta) {
      this.mostrarToast('Por favor ingrese una fecha', 'error');
      return;
    }

    if (this.medicamentosTemp.length === 0) {
      this.mostrarToast('Debe agregar al menos un medicamento', 'error');
      return;
    }

    const payload = {
      ...this.nuevaReceta,
      detalles: this.medicamentosTemp
    };

    this.srvReceta.crearReceta(payload as any).subscribe({
      next: () => {
        this.mostrarToast('Receta creada exitosamente', 'success');

        // Limpiar formulario
        this.medicamentosTemp = [];
        this.nuevaReceta = {
          consulta: this.consulta.id,
          fecha_receta: '',
          observaciones: ''
        };

        this.cargarRecetas();
      },
      error: () => this.mostrarToast('Error al crear receta', 'error')
    });
  }

  // ==================== VER DETALLES ====================
  verDetalles(r: Receta): void {
    this.recetaSeleccionada = r;
    this.detalles = [];

    this.srvReceta.getDetallesPorReceta(r.id).subscribe({
      next: (data) => {
        this.detalles = data.results ?? data;
      },
      error: () => this.mostrarToast('Error al cargar detalles', 'error')
    });
  }

  cerrarModalDetalles(): void {
    this.recetaSeleccionada = null;
  }

  // ==================== ELIMINAR ====================
  confirmarEliminar(item: any, tipo: 'receta' | 'detalle'): void {
    this.elementoSeleccionado = item;
    this.tipoEliminacion = tipo;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.elementoSeleccionado = null;
    this.tipoEliminacion = null;
    this.mostrarModalEliminar = false;
  }

  eliminar(): void {
    if (!this.tipoEliminacion || !this.elementoSeleccionado) return;

    this.mostrarModalEliminar = false;

    if (this.tipoEliminacion === 'receta') {
      this.srvReceta.eliminarReceta(this.elementoSeleccionado.id).subscribe({
        next: () => {
          this.mostrarToast('Receta eliminada exitosamente', 'success');
          this.cargarRecetas();
          this.recetaSeleccionada = null;
        },
        error: () => this.mostrarToast('Error al eliminar receta', 'error')
      });
    }
  }

  // ==================== EDITAR ====================
  editarReceta(r: Receta): void {
    // Cerrar modal de detalles si estaba abierto
    this.recetaSeleccionada = null;

    this.recetaEditando = r;
    this.editFecha = r.fecha_receta;
    this.editObservaciones = r.observaciones || '';
    this.editMedicamentos = [];

    this.srvReceta.getDetallesPorReceta(r.id).subscribe({
      next: data => {
        const detalles = data.results ?? data;

        this.editMedicamentos = detalles.map((d: any) => ({
          receta: r.id,
          medicamento: d.medicamento,
          dosis: d.dosis,
          frecuencia: d.frecuencia,
          duracion: d.duracion,
          indicaciones: d.indicaciones || ''
        }));

        this.editNuevoMed = {
          receta: r.id,
          medicamento: '',
          dosis: '',
          frecuencia: '',
          duracion: '',
          indicaciones: ''
        };

        this.modalEditarAbierto = true;
      },
      error: () => this.mostrarToast('Error al cargar medicamentos', 'error')
    });
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.recetaEditando = null;
  }

  agregarMedEdit(): void {
    if (!this.editNuevoMed.medicamento.trim()) {
      this.mostrarToast('Debe ingresar el nombre del medicamento', 'error');
      return;
    }

    this.editMedicamentos.push({ ...this.editNuevoMed });

    this.editNuevoMed = {
      receta: this.recetaEditando!.id,
      medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      indicaciones: ''
    };

    this.mostrarToast('Medicamento agregado', 'success');
  }

  quitarMedEdit(i: number): void {
    this.editMedicamentos.splice(i, 1);
    this.mostrarToast('Medicamento eliminado', 'success');
  }

  guardarCambiosReceta(): void {
    if (!this.recetaEditando) return;

    if (!this.editFecha) {
      this.mostrarToast('Por favor ingrese una fecha', 'error');
      return;
    }

    const payload = {
      fecha_receta: this.editFecha,
      observaciones: this.editObservaciones,
      detalles: this.editMedicamentos.map(med => ({
        ...med,
        indicaciones: med.indicaciones || ''
      }))
    };

    this.srvReceta.editarReceta(this.recetaEditando.id, payload).subscribe({
      next: () => {
        this.mostrarToast('Receta actualizada exitosamente', 'success');
        this.cerrarModalEditar();
        this.cargarRecetas();
      },
      error: () => this.mostrarToast('Error al actualizar receta', 'error')
    });
  }

  // ==================== UTILIDADES ====================
  mostrarToast(m: string, tipo: 'success' | 'error' = 'error'): void {
    const t: ToastMsg = { mensaje: m, tipo, mostrar: true };
    this.toasts.push(t);
    setTimeout(() => {
      t.mostrar = false;
      // Remover del array después de la animación
      setTimeout(() => {
        const index = this.toasts.indexOf(t);
        if (index > -1) {
          this.toasts.splice(index, 1);
        }
      }, 500);
    }, 3500);
  }

  volver(): void {
    this.router.navigate(['/consultas/lista']);
  }
}