import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({ providedIn: 'root' })
export class ExportService {
  /** Método alternativo para descargar archivos sin file-saver */
  private descargarArchivo(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // NUEVO: Método para preparar datos de bitácora
  prepararDatosBitacora(registros: any[]): any[] {
    return registros.map(registro => ({
      'ID': registro.id,
      'Fecha y Hora': new Date(registro.fecha_hora).toLocaleString('es-ES'),
      'Usuario': registro.usuario?.email || 'N/A',
      'Nombre Completo': `${registro.usuario?.nombre || ''} ${registro.usuario?.apellido || ''}`.trim() || 'N/A',
      'Acción': registro.accion_realizada,
      'Módulo': registro.modulo_afectado,
      'IP': registro.ip_address,
      'Detalles': registro.detalles || 'Sin detalles'
    }));
  }

  // NUEVO: Método para preparar datos de pacientes
  prepararDatosPacientes(pacientes: any[]): any[] {
    return pacientes.map((paciente) => ({
      'ID': paciente.id,
      'Nombre': paciente.nombre,
      'Apellido': paciente.apellido,
      'Email': paciente.email,
      'Teléfono': paciente.telefono || 'No especificado',
      'Fecha Nacimiento': paciente.fecha_nacimiento
        ? new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES')
        : 'No especificada',
      'Edad': this.calcularEdad(paciente.fecha_nacimiento),
      'Género': this.getGenderLabel(paciente.genero),
      'Dirección': paciente.direccion || 'No especificada',
      'Alergias': paciente.alergias || 'Ninguna registrada',
      'Medicamentos Actuales': paciente.medicamentos_actuales || 'Ninguno registrado',
      'Antecedentes Médicos': paciente.antecedentes_medicos || 'Ninguno registrado',
      'Estado': paciente.activo ? 'Activo' : 'Inactivo',
      'Fecha Creación': paciente.fecha_creacion
        ? new Date(paciente.fecha_creacion).toLocaleDateString('es-ES')
        : 'No disponible',
    }));
  }

  // NUEVO: Método para preparar datos de consultas
prepararDatosConsultas(consultas: any[]): any[] {
  return (consultas || []).map((c) => ({
    'ID': c.id,
    'Paciente': `${c.paciente_nombre || ''} ${c.paciente_apellido || ''}`.trim() || '—',
    'Email Paciente': c.paciente_email || '—',
    'Médico': `Dr. ${c.medico_nombre || ''} ${c.medico_apellido || ''}`.trim() || '—',
    'Motivo de Consulta': c.motivo_consulta || '—',
    'Diagnóstico': c.diagnostico || '—',
    'Tratamiento': c.tratamiento || '—',
    'Presión Arterial': c.presion_arterial || '—',
    'Temperatura (°C)': c.temperatura ?? '—',
    'Frecuencia Cardíaca': c.frecuencia_cardiaca ?? '—',
    'Frecuencia Respiratoria': c.frecuencia_respiratoria ?? '—',
    'Saturación O₂ (%)': c.saturacion_oxigeno ?? '—',
    'Peso (kg)': c.peso ?? '—',
    'Altura (m)': c.altura ?? '—',
    'IMC': c.imc ?? '—',
    'Próxima Cita': c.proxima_cita
      ? new Date(c.proxima_cita).toLocaleDateString('es-ES')
      : '—',
    'Fecha Consulta': c.fecha_consulta
      ? new Date(c.fecha_consulta).toLocaleString('es-ES')
      : '—',
    'Notas Privadas': c.notas_privadas || '—'
  }));
}


  /** Método auxiliar para calcular edad */
  private calcularEdad(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'N/A';
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return `${edad} años`;
  }

  /** Convertir datos para exportación - USUARIOS */
  prepararDatosUsuarios(usuarios: any[]): any[] {
    return usuarios.map((usuario) => ({
      ID: usuario.id,
      Nombre: usuario.nombre,
      Apellido: usuario.apellido,
      Email: usuario.email,
      Rol: this.getRoleLabel(usuario),
      Teléfono: usuario.telefono || 'No especificado',
      Estado: usuario.activo ? 'Activo' : 'Inactivo',
      Género: this.getGenderLabel(usuario.genero),
      'Fecha Nacimiento': usuario.fecha_nacimiento
        ? new Date(usuario.fecha_nacimiento).toLocaleDateString('es-ES')
        : 'No especificada',
      Dirección: usuario.direccion || 'No especificada',
    }));
  }

  private getRoleLabel(usuario: any): string {
    const role = usuario.rol?.nombre_rol || '';
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'medico':
        return 'Médico';
      case 'paciente':
        return 'Paciente';
      default:
        return role || 'No especificado';
    }
  }

  getGenderLabel(genero: string): string {
    switch (genero) {
      case 'M':
        return 'Masculino';
      case 'F':
        return 'Femenino';
      case 'O':
        return 'Otro';
      default:
        return 'No especificado';
    }
  }

  /** Exportar a Excel */
  exportToExcel(data: any[], filename: string): void {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      this.descargarArchivo(blob, `${filename}.xlsx`);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw error;
    }
  }

  /** Exportar a PDF - VERSIÓN CORREGIDA */
  exportToPDF(data: any[], filename: string, title: string): void {
    try {
      console.log('Generando PDF con datos:', data);

      // Usar orientación horizontal (landscape)
      const doc = new jsPDF('landscape');

      // Configuración
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;
      const lineHeight = 8;
      const maxY = pageHeight - 20;

      // Título
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(title, margin, yPosition);
      yPosition += 10;

      // Fecha e información
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
        margin,
        yPosition
      );
      doc.text(`Total de registros: ${data.length}`, pageWidth - 60, yPosition);
      yPosition += 12;

      if (data.length === 0) {
        doc.text('No hay datos para mostrar', margin, yPosition);
        doc.save(`${filename}.pdf`);
        return;
      }

      // Obtener cabeceras
      const headers = Object.keys(data[0]);
      console.log('Cabeceras encontradas:', headers);

      // Calcular anchos de columnas fijos (más simple)
      const columnWidths = this.calculateFixedColumnWidths(
        headers,
        pageWidth - margin * 2
      );
      console.log('Anchos de columnas:', columnWidths);

      // DIBUJAR CABECERAS
      doc.setFillColor(58, 83, 155);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');

      let xPosition = margin;

      // Dibujar fondo de cabeceras
      headers.forEach((header, index) => {
        doc.rect(xPosition, yPosition, columnWidths[index], lineHeight, 'F');
        xPosition += columnWidths[index];
      });

      // Dibujar texto de cabeceras
      xPosition = margin;
      headers.forEach((header, index) => {
        const text = this.truncateText(header, 20);
        // Centrar texto en la columna
        const textWidth = doc.getTextWidth(text);
        const textX = xPosition + (columnWidths[index] - textWidth) / 2;
        doc.text(text, textX, yPosition + 5.5);
        xPosition += columnWidths[index];
      });

      yPosition += lineHeight;

      // DIBUJAR FILAS
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      let pageNumber = 1;
      let totalPages = 1; // Inicializar contador de páginas

      data.forEach((row, rowIndex) => {
        // Verificar si necesita nueva página
        if (yPosition + lineHeight > maxY) {
          doc.addPage('landscape');
          pageNumber++;
          totalPages = pageNumber;
          yPosition = margin;

          // REDIBUJAR CABECERAS EN NUEVA PÁGINA
          doc.setFillColor(58, 83, 155);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);

          // Fondo de cabeceras
          xPosition = margin;
          headers.forEach((header, index) => {
            doc.rect(
              xPosition,
              yPosition,
              columnWidths[index],
              lineHeight,
              'F'
            );
            xPosition += columnWidths[index];
          });

          // Texto de cabeceras
          xPosition = margin;
          headers.forEach((header, index) => {
            const text = this.truncateText(header, 20);
            const textWidth = doc.getTextWidth(text);
            const textX = xPosition + (columnWidths[index] - textWidth) / 2;
            doc.text(text, textX, yPosition + 5.5);
            xPosition += columnWidths[index];
          });

          yPosition += lineHeight;
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
        }

        // Color de fondo alternado
        if (rowIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          xPosition = margin;
          headers.forEach((_, index) => {
            doc.rect(
              xPosition,
              yPosition,
              columnWidths[index],
              lineHeight,
              'F'
            );
            xPosition += columnWidths[index];
          });
        }

        // Texto de las celdas
        xPosition = margin;
        headers.forEach((header, colIndex) => {
          const value = row[header]?.toString() || '';
          const displayText = this.truncateText(value, 25);
          doc.text(displayText, xPosition + 3, yPosition + 5.5);
          xPosition += columnWidths[colIndex];
        });

        yPosition += lineHeight;
      });

      // ACTUALIZAR totalPages después de procesar todas las filas
      totalPages = pageNumber;

      // PIE DE PÁGINA - Método alternativo sin getNumberOfPages
      this.addFooterToAllPages(doc, totalPages, pageWidth, pageHeight);

      doc.save(`${filename}.pdf`);
      console.log(
        'PDF generado exitosamente con',
        data.length,
        'registros en',
        totalPages,
        'páginas'
      );
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      throw error;
    }
  }

  /** Agregar pie de página a todas las páginas */
  private addFooterToAllPages(
    doc: jsPDF,
    totalPages: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    // Para cada página, agregar el pie de página
    for (let i = 1; i <= totalPages; i++) {
      // En jsPDF, las páginas empiezan en 1
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${totalPages} - Sistema de Gestión Documental`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }
  }

  /** Calcular anchos de columnas fijos */
  private calculateFixedColumnWidths(
    headers: string[],
    totalWidth: number
  ): number[] {
    // Asignar anchos basados en el tipo de dato esperado
    const fixedWidths: { [key: string]: number } = {
      id: 15,
      ID: 15,
      nombre: 30,
      Nombre: 30,
      apellido: 30,
      Apellido: 30,
      email: 40,
      Email: 40,
      rol: 25,
      Rol: 25,
      teléfono: 25,
      Teléfono: 25,
      estado: 20,
      Estado: 20,
      género: 20,
      Género: 20,
      fecha: 25,
      Fecha: 25,
      dirección: 35,
      Dirección: 35,
      'fecha y hora': 30,
      'Fecha y Hora': 30,
      'nombre completo': 35,
      'Nombre Completo': 35,
      acción: 40,
      Acción: 40,
      módulo: 25,
      Módulo: 25,
      ip: 20,
      IP: 20,
      detalles: 50,
      Detalles: 50,
      alergias: 40,
      Alergias: 40,
      medicamentos: 40,
      'Medicamentos Actuales': 40,
      antecedentes: 50,
      'Antecedentes Médicos': 50,
      edad: 15,
      Edad: 15,
    };

    // Asignar anchos específicos o usar ancho por defecto
    const widths = headers.map((header) => {
      const lowerHeader = header.toLowerCase();
      for (const [key, width] of Object.entries(fixedWidths)) {
        if (lowerHeader.includes(key.toLowerCase())) {
          return width;
        }
      }
      return 25; // Ancho por defecto
    });

    // Ajustar proporcionalmente si la suma excede el ancho total
    const totalCurrentWidth = widths.reduce((sum, width) => sum + width, 0);

    if (totalCurrentWidth > totalWidth) {
      const scaleFactor = totalWidth / totalCurrentWidth;
      return widths.map((width) => Math.floor(width * scaleFactor));
    }

    return widths;
  }

  /** Truncar texto muy largo */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /** Exportar tabla HTML a PDF (alternativa) */
  exportTableToPDF(elementId: string, filename: string, title: string): void {
    const element = document.getElementById(elementId);

    if (!element) {
      console.error('Elemento no encontrado:', elementId);
      throw new Error('Elemento no encontrado');
    }

    html2canvas(element)
      .then((canvas) => {
        try {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('landscape', 'mm', 'a4');
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.setFontSize(16);
          pdf.text(title, 14, 15);
          pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth - 20, pdfHeight - 20);
          pdf.save(`${filename}.pdf`);
        } catch (error) {
          console.error('Error en exportTableToPDF:', error);
          throw error;
        }
      })
      .catch((error) => {
        console.error('Error con html2canvas:', error);
        throw error;
      });
  }

  /** Exportar a HTML */
  exportToHTML(data: any[], filename: string, title: string): void {
    try {
      let htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>${this.escapeHtml(title)}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              border-bottom: 3px solid #3498db; 
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            h1 { 
              color: #2c3e50; 
              margin: 0;
              font-size: 24px;
            }
            .subtitle {
              color: #7f8c8d;
              font-size: 14px;
              margin: 5px 0 0 0;
            }
            .table-container {
              overflow-x: auto;
              margin-top: 20px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              min-width: 800px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 10px; 
              text-align: left; 
              white-space: nowrap;
            }
            th { 
              background-color: #3498db; 
              color: white; 
              font-weight: 600;
              font-size: 13px;
              position: sticky;
              top: 0;
            }
            tr:nth-child(even) { 
              background-color: #f8f9fa; 
            }
            tr:hover {
              background-color: #e8f4fd;
            }
            .footer { 
              margin-top: 30px; 
              color: #7f8c8d; 
              font-size: 12px;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            .summary {
              background-color: #f8f9fa;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.escapeHtml(title)}</h1>
            <p class="subtitle">Generado el: ${new Date().toLocaleDateString(
              'es-ES'
            )}</p>
          </div>
          
          <div class="summary">
            <strong>Resumen:</strong> ${data.length} registro(s) encontrado(s)
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
      `;

      // Cabeceras
      const headers = Object.keys(data[0]);
      headers.forEach((header) => {
        htmlContent += `<th>${this.escapeHtml(header)}</th>`;
      });

      htmlContent += `
                </tr>
              </thead>
              <tbody>
      `;

      // Filas
      data.forEach((item) => {
        htmlContent += '<tr>';
        headers.forEach((header) => {
          const value = item[header] || '';
          htmlContent += `<td>${this.escapeHtml(value.toString())}</td>`;
        });
        htmlContent += '</tr>';
      });

      htmlContent += `
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>Sistema de Gestión Documental - Reporte generado automáticamente</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      this.descargarArchivo(blob, `${filename}.html`);
    } catch (error) {
      console.error('Error al exportar a HTML:', error);
      throw error;
    }
  }

  /** Escapar HTML para prevenir inyección */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}