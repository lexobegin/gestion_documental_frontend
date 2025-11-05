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
  styleUrls: ['./receta-list.component.scss'],
})
export class RecetaListComponent implements OnInit {
  consultasDisponibles: any[] = [];
  recetas: Receta[] = [];
  recetaSeleccionada: Receta | null = null;
  consultaSeleccionada: any | null = null;
  mostrarModalDetalle = false;
  mostrarModalConsulta = false;

  busqueda: string = '';
  estadoFiltro: string = 'todos';
  fechaFiltro: string = '';
  filtroMedico: string = 'todos';
  filtroPaciente: string = 'todos';
  filtroDesde: string = '';
  filtroHasta: string = '';
  c: any;

  constructor(private router: Router, private recetasService: RecetasService) {}

  ngOnInit(): void {
    this.cargarConsultas();
    this.cargarRecetas();
  }

  // 🔹 Cargar consultas reales desde backend
  cargarConsultas(): void {
    this.recetasService.obtenerConsultas().subscribe({
      next: (data) => {
        console.log('Consultas desde backend:', data);
        this.consultasDisponibles = data.results ? data.results : data;
      },
      error: (err) => {
        console.error('❌ Error al cargar consultas:', err);
      },
    });
  }

   // 🔹 Cargar recetas reales desde backend
  cargarRecetas(): void {
    this.recetasService.getRecetas().subscribe({
      next: (data) => {
        console.log('Recetas desde backend:', data);
        this.recetas = data.results ? data.results : data;
      },
      error: (err) => {
        console.error('❌ Error al cargar recetas:', err);
      },
    });
  }

  get consultasFiltradas(): any[] {
    return this.consultasDisponibles.filter(consulta => {
      const cumpleBusqueda = this.busqueda === '' || 
        consulta.paciente.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        consulta.medico.toLowerCase().includes(this.busqueda.toLowerCase());
      
      const cumpleEstado = this.estadoFiltro === 'todos' || consulta.estado === this.estadoFiltro;
      const cumpleFecha = this.fechaFiltro === '' || consulta.fecha === this.fechaFiltro;
      
      return cumpleBusqueda && cumpleEstado && cumpleFecha;
    });
  }

  get recetasFiltradas(): Receta[] {
  return this.recetas.filter(receta => {
    const cumpleBusqueda =
      this.busqueda === '' ||
      receta.paciente.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      receta.medico.toLowerCase().includes(this.busqueda.toLowerCase());

    const cumpleMedico =
      this.filtroMedico === 'todos' || receta.medico === this.filtroMedico;

    const cumplePaciente =
      this.filtroPaciente === 'todos' || receta.paciente === this.filtroPaciente;

    const fechaReceta = new Date(receta.fecha_receta);
    const desde = this.filtroDesde ? new Date(this.filtroDesde) : null;
    const hasta = this.filtroHasta ? new Date(this.filtroHasta) : null;

    const cumpleFechas =
      (!desde || fechaReceta >= desde) && (!hasta || fechaReceta <= hasta);

    return cumpleBusqueda && cumpleMedico && cumplePaciente && cumpleFechas;
  });
}

get medicosUnicos(): string[] {
  return [...new Set(this.recetas.map(r => r.medico))];
}

get pacientesUnicos(): string[] {
  return [...new Set(this.recetas.map(r => r.paciente))];
}

  limpiarFiltros(): void {
  this.busqueda = '';
  this.estadoFiltro = 'todos';
  this.fechaFiltro = '';
  this.filtroMedico = 'todos';
  this.filtroPaciente = 'todos';
  this.filtroDesde = '';
  this.filtroHasta = '';
}

  verDetalleConsulta(consulta: any): void {
    this.consultaSeleccionada = consulta;
    this.mostrarModalConsulta = true;
  }

  crearRecetaDesdeConsulta(idConsulta: number): void {
  this.router.navigate(['/recetas/crear'], { queryParams: { idConsulta } });
}

  eliminarConsulta(id: number): void {
    if (confirm('¿Seguro que deseas eliminar esta consulta?')) {
      this.consultasDisponibles = this.consultasDisponibles.filter(c => c.id !== id);
    }
  }

  verReceta(receta: Receta): void {
    this.recetaSeleccionada = receta;
    this.mostrarModalDetalle = true;
  }

  editarReceta(id: number): void {
  this.router.navigate(['/recetas/editar', id]);
}

  eliminarReceta(id: number): void {
    if (confirm('¿Seguro que deseas eliminar esta receta?')) {
      this.recetasService.deleteReceta(id).subscribe({
        next: () => {
          this.recetas = this.recetas.filter((r) => r.id !== id);
        },
        error: (err) => {
          console.error('Error al eliminar receta:', err);
          alert('Ocurrió un error al eliminar la receta.');
        },
      });
    }
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.recetaSeleccionada = null;
  }

  cerrarModalConsulta(): void {
    this.mostrarModalConsulta = false;
    this.consultaSeleccionada = null;
  }

  // ========== MÉTODOS DE EXPORTACIÓN de consulta ==========

exportarConsultasPDF(): void {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Consultas Médicas', 14, 18);
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 25);

  const data = this.consultasFiltradas.map(c => [
    c.id,
    c.paciente,
    c.medico,
    c.especialidad,
    c.estado,
    this.formatearFecha(c.fecha),
    c.hora,
    c.motivo
  ]);

  autoTable(doc, {
    head: [['ID', 'Paciente', 'Médico', 'Especialidad', 'Estado', 'Fecha', 'Hora', 'Motivo']],
    body: data,
    startY: 30,
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 }
  });

  doc.save('consultas.pdf');
}

exportarConsultasExcel(): void {
  const data = this.consultasFiltradas.map(c => ({
    ID: c.id,
    Paciente: c.paciente,
    Médico: c.medico,
    Especialidad: c.especialidad,
    Estado: c.estado,
    Fecha: this.formatearFecha(c.fecha),
    Hora: c.hora,
    Motivo: c.motivo
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Consultas');
  XLSX.writeFile(wb, 'consultas.xlsx');
}
exportarConsultasHTML(): void {
  const table = document.createElement('table');
  const headers = ['ID', 'Paciente', 'Médico', 'Especialidad', 'Estado', 'Fecha', 'Hora', 'Motivo'];

  // Crear encabezados
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // Cuerpo
  const tbody = document.createElement('tbody');
  this.consultasFiltradas.forEach(c => {
    const tr = document.createElement('tr');
    [c.id, c.paciente, c.medico, c.especialidad, c.estado, this.formatearFecha(c.fecha), c.hora, c.motivo]
      .forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // Descargar archivo
  const blob = new Blob(['<html><body>' + table.outerHTML + '</body></html>'], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'consultas.html';
  a.click();
  window.URL.revokeObjectURL(url);
}
  
// ========== Metodos de exportacion de recetas ==========
  
exportarRecetasPDF(): void {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Recetas Médicas', 14, 18);
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 25);

  const data = this.recetasFiltradas.map(r => [
    r.id,
    r.paciente,
    r.medico,
    r.diagnostico,
    this.formatearFecha(r.fecha_receta)
  ]);

  autoTable(doc, {
    head: [['ID', 'Paciente', 'Médico', 'Diagnóstico', 'Fecha']],
    body: data,
    startY: 30,
    headStyles: { fillColor: [22, 163, 74] },
    styles: { fontSize: 9 }
  });

  doc.save('recetas.pdf');
}

exportarRecetasExcel(): void {
  const data = this.recetasFiltradas.map(r => ({
    ID: r.id,
    Paciente: r.paciente,
    Médico: r.medico,
    Diagnóstico: r.diagnostico,
    Fecha: this.formatearFecha(r.fecha_receta),
    Observaciones: r.observaciones
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Recetas');
  XLSX.writeFile(wb, 'recetas.xlsx');
}

exportarRecetasHTML(): void {
  // Crear tabla
  const table = document.createElement('table');
  const headers = ['ID', 'Paciente', 'Médico', 'Diagnóstico', 'Fecha', 'Observaciones'];

  // === Encabezados ===
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // === Cuerpo ===
  const tbody = document.createElement('tbody');
  this.recetasFiltradas.forEach(r => {
    const tr = document.createElement('tr');
    const valores = [
      r.id,
      r.paciente,
      r.medico,
      r.diagnostico,
      this.formatearFecha(r.fecha_receta),
      r.observaciones || ''
    ];

    valores.forEach(valor => {
      const td = document.createElement('td');
      td.textContent = String(valor);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // === Descargar archivo ===
  const blob = new Blob(['<html><body>' + table.outerHTML + '</body></html>'], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recetas.html';
  a.click();
  window.URL.revokeObjectURL(url);
}

imprimirReceta(): void { 
  const r = this.recetaSeleccionada;
  if (!r) {
    alert('No hay receta seleccionada');
    return;
  }

  try {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Receta Médica Detallada', 14, 18);
    doc.setFontSize(10);
    doc.text(`Fecha de impresión: ${new Date().toLocaleDateString('es-ES')}`, 14, 25);

    doc.setFontSize(11);
    doc.text(`Paciente: ${r.paciente}`, 14, 35);
    doc.text(`Médico: ${r.medico}`, 14, 41);
    doc.text(`Diagnóstico: ${r.diagnostico}`, 14, 47);
    doc.text(`Fecha: ${this.formatearFecha(r.fecha_receta)}`, 14, 53);

    doc.text('Observaciones:', 14, 63);
    const obs = r.observaciones || 'Sin observaciones.';
    doc.text(doc.splitTextToSize(obs, 180), 14, 69);

    if (r.detalles && r.detalles.length > 0) {
      const data = r.detalles.map((d: any) => [
        d.nombre_medicamento,
        d.dosis,
        d.frecuencia,
        d.duracion,
        d.indicaciones || '-',
      ]);

      autoTable(doc, {
        startY: 85,
        head: [['Medicamento', 'Dosis', 'Frecuencia', 'Duración', 'Indicaciones']],
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113] },
        styles: { fontSize: 9 },
      });
    } else {
      doc.text('No hay medicamentos registrados.', 14, 85);
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.text('Firma del Médico: ___________________________', 14, pageHeight - 30);
    doc.text('Firma del Paciente: ___________________________', 120, pageHeight - 30);

    doc.save(`Receta_${r.paciente.replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error('Error al generar PDF:', err);
  }
}

  formatearFecha(fecha: string): string {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
