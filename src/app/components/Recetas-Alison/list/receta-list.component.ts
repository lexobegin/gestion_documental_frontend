import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Receta } from '../../../models/recetas/receta.model';
import { RecetasService } from '../../../services/recetas/recetas.service';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-receta-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './receta-list.component.html',

})
export class RecetaListComponent implements OnInit {

  recetas: Receta[] = [];
  recetaSeleccionada: Receta | null = null;

  busqueda: string = '';
  filtroMedico: string = 'todos';
  filtroPaciente: string = 'todos';
  filtroDesde: string = '';
  filtroHasta: string = '';

  mostrarModalDetalle = false;

  constructor(private router: Router, private recetasService: RecetasService) {}

  ngOnInit(): void {
    this.cargarRecetas();
  }

  // ========== Cargar recetas ==========
  cargarRecetas(): void {
    this.recetasService.getRecetas().subscribe({
      next: (data) => {
        this.recetas = data.results ? data.results : data;
      },
      error: (err) => console.error('❌ Error al cargar recetas:', err),
    });
  }

  // ========== Filtros ==========
  get recetasFiltradas(): Receta[] {
    return this.recetas.filter((r) => {
      const cumpleBusqueda =
        this.busqueda === '' ||
        r.paciente_nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        r.medico_nombre.toLowerCase().includes(this.busqueda.toLowerCase());

      const cumpleMedico =
        this.filtroMedico === 'todos' || r.medico_nombre === this.filtroMedico;

      const cumplePaciente =
        this.filtroPaciente === 'todos' || r.paciente_nombre === this.filtroPaciente;

      const fechaReceta = new Date(r.fecha_receta);
      const desde = this.filtroDesde ? new Date(this.filtroDesde) : null;
      const hasta = this.filtroHasta ? new Date(this.filtroHasta) : null;

      const cumpleFechas =
        (!desde || fechaReceta >= desde) &&
        (!hasta || fechaReceta <= hasta);

      return cumpleBusqueda && cumpleMedico && cumplePaciente && cumpleFechas;
    });
  }

  get medicosUnicos(): string[] {
    return [...new Set(this.recetas.map((r) => r.medico_nombre))];
  }

  get pacientesUnicos(): string[] {
    return [...new Set(this.recetas.map((r) => r.paciente_nombre))];
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroMedico = 'todos';
    this.filtroPaciente = 'todos';
    this.filtroDesde = '';
    this.filtroHasta = '';
  }

  // ========== Modal ==========
  verReceta(receta: Receta): void {
    this.recetaSeleccionada = receta;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.recetaSeleccionada = null;
  }

  editarReceta(id: number): void {
    this.router.navigate(['/recetas/editar', id]);
  }

  eliminarReceta(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar esta receta?')) return;

    this.recetasService.eliminarReceta(id).subscribe({
      next: () => {
        this.recetas = this.recetas.filter((r) => r.id !== id);
      },
      error: (err) => {
        console.error('❌ Error al eliminar receta:', err);
      },
    });
  }

  // ========== EXPORTAR PDF ==========
  exportarRecetasPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Recetas Médicas', 14, 18);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 25);

    const data = this.recetasFiltradas.map((r) => [
      r.id,
      r.paciente_nombre,
      r.medico_nombre,
      this.formatearFecha(r.fecha_receta),
      r.observaciones || ''
    ]);

    autoTable(doc, {
      head: [['ID', 'Paciente', 'Médico', 'Fecha', 'Observaciones']],
      body: data,
      startY: 30,
      headStyles: { fillColor: [22, 163, 74] },
      styles: { fontSize: 9 }
    });

    doc.save('recetas.pdf');
  }

  // ========== EXPORTAR EXCEL ==========
  exportarRecetasExcel(): void {
    const data = this.recetasFiltradas.map((r) => ({
      ID: r.id,
      Paciente: r.paciente_nombre,
      Médico: r.medico_nombre,
      Fecha: this.formatearFecha(r.fecha_receta),
      Observaciones: r.observaciones || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recetas');
    XLSX.writeFile(wb, 'recetas.xlsx');
  }

  // ========== EXPORTAR HTML ==========
  exportarRecetasHTML(): void {
    const table = document.createElement('table');
    const headers = ['ID', 'Paciente', 'Médico', 'Fecha', 'Observaciones'];

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    headers.forEach((h) => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    this.recetasFiltradas.forEach((r) => {
      const tr = document.createElement('tr');
      const values = [
        r.id,
        r.paciente_nombre,
        r.medico_nombre,
        this.formatearFecha(r.fecha_receta),
        r.observaciones || '',
      ];

      values.forEach((v) => {
        const td = document.createElement('td');
        td.textContent = String(v);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const blob = new Blob(
      ['<html><body>' + table.outerHTML + '</body></html>'],
      { type: 'text/html' }
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recetas.html';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ========== IMPRIMIR RECETA ==========
  imprimirReceta(): void {
    const r = this.recetaSeleccionada;
    if (!r) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Receta Médica', 14, 18);
    doc.setFontSize(10);
    doc.text(`Fecha impresión: ${new Date().toLocaleDateString('es-ES')}`, 14, 25);

    doc.text(`Paciente: ${r.paciente_nombre}`, 14, 35);
    doc.text(`Médico: ${r.medico_nombre}`, 14, 41);
    doc.text(`Fecha Receta: ${this.formatearFecha(r.fecha_receta)}`, 14, 47);

    doc.text('Observaciones:', 14, 57);
    doc.text(doc.splitTextToSize(r.observaciones || 'Sin observaciones', 180), 14, 63);

    if (r.detalles && r.detalles.length > 0) {
      const data = r.detalles.map((d) => [
        d.medicamento,
        d.dosis,
        d.frecuencia,
        d.duracion,
        d.indicaciones || '',
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['Medicamento', 'Dosis', 'Frecuencia', 'Duración', 'Indicaciones']],
        body: data,
      });
    } else {
      doc.text('No hay medicamentos registrados.', 14, 80);
    }

    doc.save(`Receta_${r.paciente_nombre.replace(/\s+/g, '_')}.pdf`);
  }

  // ========== FORMATEAR FECHA ==========
  formatearFecha(fecha: string): string {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
