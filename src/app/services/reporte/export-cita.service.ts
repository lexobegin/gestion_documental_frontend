import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class ExportCitaService {
  //const datos = this.exportService.prepararDatosCitas(listaDeCitas);
  //this.exportService.exportToPDF(datos, 'reporte_citas', 'Listado de Citas');
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

  /** Convertir datos para exportación */
  prepararDatosCitas(citas: any[]): any[] {
    return citas.map((cita) => ({
      ID: cita.id,
      Paciente: `${cita.paciente_nombre} ${cita.paciente_apellido}`.trim(),
      Médico: `${cita.medico_nombre} ${cita.medico_apellido}`.trim(),
      Especialidad: cita.especialidad_nombre,
      'Fecha de la Cita': new Date(cita.fecha_cita).toLocaleDateString('es-ES'),
      'Hora de la Cita': cita.hora_cita,
      Estado: this.capitalizeFirstLetter(cita.estado),
      Motivo: cita.motivo,
      Notas: cita.notas || 'Sin notas',
      'Fecha de Creación': new Date(cita.fecha_creacion).toLocaleString(
        'es-ES'
      ),
      'Última Actualización': new Date(cita.fecha_actualizacion).toLocaleString(
        'es-ES'
      ),
    }));
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
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
      //console.log('Cabeceras encontradas:', headers);

      // Calcular anchos de columnas fijos (más simple)
      const columnWidths = this.calculateFixedColumnWidths(
        headers,
        pageWidth - margin * 2
      );
      //console.log('Anchos de columnas:', columnWidths);

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

  exportToPDFAsCards(data: any[], filename: string, title: string): void {
    try {
      const doc = new jsPDF('portrait');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 6;
      const spacingBetweenCards = 10;
      let yPosition = margin;

      // Título
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(title, margin, yPosition);
      yPosition += 10;

      // Fecha e info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
        margin,
        yPosition
      );
      doc.text(`Total de registros: ${data.length}`, pageWidth - 60, yPosition);
      yPosition += 10;

      if (data.length === 0) {
        doc.text('No hay datos para mostrar', margin, yPosition);
        doc.save(`${filename}.pdf`);
        return;
      }

      // Obtener el ancho máximo de los nombres de campo
      const allKeys = new Set<string>();
      data.forEach((row) =>
        Object.keys(row).forEach((key) => allKeys.add(key))
      );

      let maxLabelWidth = 0;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      allKeys.forEach((key) => {
        const labelWidth = doc.getTextWidth(key + ':');
        if (labelWidth > maxLabelWidth) {
          maxLabelWidth = labelWidth;
        }
      });

      let pageNumber = 1;
      let totalPages = 1;

      // Preparar fuente para datos
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      data.forEach((row, rowIndex) => {
        const keys = Object.keys(row);

        const cardHeight = keys.length * lineHeight + spacingBetweenCards;
        if (yPosition + cardHeight > pageHeight - margin) {
          doc.addPage('portrait');
          pageNumber++;
          totalPages = pageNumber;
          yPosition = margin;
        }

        keys.forEach((key) => {
          const label = `${key}:`;
          const value = row[key]?.toString() || '';
          const truncatedValue = this.truncateText(value, 100);

          // Etiqueta (negrita)
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, yPosition);

          // Valor (alineado después de la etiqueta)
          doc.setFont('helvetica', 'normal');
          doc.text(truncatedValue, margin + maxLabelWidth + 4, yPosition); // +4px de espacio entre label y valor

          yPosition += lineHeight;
        });

        // Línea divisoria
        yPosition += 2;
        doc.setDrawColor(200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += spacingBetweenCards;
      });

      // Pie de página
      this.addFooterToAllPages(doc, totalPages, pageWidth, pageHeight);

      doc.save(`${filename}.pdf`);
      console.log('PDF (formato tarjeta ajustado) generado exitosamente.');
    } catch (error) {
      console.error('Error al exportar a PDF en formato tarjeta:', error);
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
      paciente: 35,
      médico: 35,
      especialidad: 30,
      'fecha de la cita': 25,
      'hora de la cita': 20,
      estado: 20,
      motivo: 35,
      notas: 40,
      'fecha de creación': 30,
      'última actualización': 30,
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
