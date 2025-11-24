import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamenMedico, ExamenMedicoService } from '../../../services/examen/examen-medico.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-examen-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './examen-list.component.html'
})
export class ExamenListComponent implements OnInit {

  examenes: ExamenMedico[] = [];
  cargando = false;

  mostrarModal = false;
  examenSeleccionado: ExamenMedico | null = null;
  resultadoForm!: FormGroup;

  constructor(
    private examenSrv: ExamenMedicoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.resultadoForm = this.fb.group({
      resultados: ['', Validators.required],
      observaciones: ['']
    });

    this.cargarExamenes();
  }

  // ===============================================
  // Cargar exámenes correctamente
  // ===============================================
  cargarExamenes() {
    this.cargando = true;

    this.examenSrv.getExamenesMedico().subscribe({
      next: (data: any) => {
        console.log("RESPUESTA BACK:", data);

        if (Array.isArray(data)) {
          this.examenes = data;
        } else if (data.results) {
          this.examenes = data.results;
        } else {
          this.examenes = [];
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando exámenes:", err);
        this.cargando = false;
      }
    });
  }

  // ===============================================
  // Abrir modal
  // ===============================================
  abrirModal(examen: ExamenMedico) {
    this.examenSeleccionado = examen;
    this.resultadoForm.reset();

    if (examen.resultados) {
      this.resultadoForm.patchValue({
        resultados: examen.resultados,
        observaciones: examen.observaciones
      });
    }

    this.mostrarModal = true;
  }

  // Cerrar modal
  cerrarModal() {
    this.mostrarModal = false;
    this.examenSeleccionado = null;
  }

  // ===============================================
  // Guardar resultado
  // ===============================================
  registrarResultado() {
    if (!this.examenSeleccionado || this.resultadoForm.invalid) return;

    this.examenSrv.registrarResultado(
      this.examenSeleccionado.id,
      this.resultadoForm.value
    ).subscribe({
      next: () => {
        alert('Resultado registrado exitosamente.');
        this.cerrarModal();
        this.cargarExamenes();
      },
      error: (err) => {
        console.error("Error guardando resultado:", err);
        alert('Error registrando resultado.');
      }
    });
  }

  // ===============================================
  // GENERAR PDF y EXCEL
  // ===============================================
  descargarPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Exámenes Médicos", 14, 15);

    const rows = this.examenes.map(ex => [
      `${ex.paciente_nombre} ${ex.paciente_apellido}`,
      ex.tipo_examen_nombre,
      ex.urgencia,
      ex.estado,
      new Date(ex.fecha_solicitud).toLocaleString(),
      ex.resultados ? "Tiene resultado" : "—"
    ]);

    autoTable(doc, {
      head: [["Paciente", "Tipo", "Urgencia", "Estado", "Fecha", "Resultado"]],
      body: rows,
      startY: 25,
    });

    doc.save("reporte_examenes.pdf");
  }

    descargarExcel() {
    if (!this.examenes.length) {
        alert("No hay datos para exportar.");
        return;
    }

    // Convertir datos a formato plano
    const data = this.examenes.map(ex => ({
        Paciente: `${ex.paciente_nombre} ${ex.paciente_apellido}`,
        "Tipo Examen": ex.tipo_examen_nombre,
        Urgencia: ex.urgencia,
        Estado: ex.estado,
        "Fecha Solicitud": new Date(ex.fecha_solicitud).toLocaleString(),
        Resultado: ex.resultados ? ex.resultados : "—",
        Observaciones: ex.observaciones ? ex.observaciones : "—"
    }));

    // Crear worksheet y workbook
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Examenes');

    // Nombre del archivo
    const nombreArchivo = `reporte_examenes_${new Date().toISOString().slice(0,10)}.xlsx`;

    // Descargar el archivo
    XLSX.writeFile(wb, nombreArchivo);

    alert("Archivo Excel descargado correctamente.");
    }


}
