import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Backup,
  ApiResponse,
  BackupCreate,
} from '../../../models/backup/backup.model';
import { BackupService } from '../../../services/backup/backup.service';

@Component({
  selector: 'app-backup-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backup-list.component.html',
  styleUrl: './backup-list.component.scss',
})
export class BackupListComponent implements OnInit {
  // Datos y estado
  backups: Backup[] = [];
  todosBackups: Backup[] = [];
  backupSeleccionado: Backup | null = null;
  backupAEliminar: Backup | null = null;

  // Estado de UI
  cargando: boolean = false;
  generandoReporte: boolean = false;
  error: string | undefined;
  mostrarModalDetalle: boolean = false;
  mostrarModalEliminar: boolean = false;

  // Búsqueda y filtros
  terminoBusqueda: string = '';
  filtroTipo: string = '';

  // Paginación
  paginaActual: number = 1;
  totalBackups: number = 0;
  totalPaginas: number = 0;
  limitePorPagina: number = 10;

  // Restore
  mostrarModalRestore: boolean = false;
  backupARestorear: Backup | null = null;
  confirmacionRestore: boolean = false;
  notasRestore: string = '';
  restoreEnProgreso: boolean = false;

  // Agregar en backup.service.ts el método para restore
  /*
restoreBackup(id: number, notas?: string): Observable<any> {
  return this.http.post(`${this.apiUrl}${id}/restore/`, { notas });
}
*/
  constructor(private backupService: BackupService) {}

  ngOnInit(): void {
    this.cargarBackups();
    this.cargarTodosBackups();
  }

  // Carga de datos
  cargarBackups(pagina: number = 1): void {
    this.cargando = true;
    this.error = undefined;

    const params: any = {
      page: pagina,
      ordering: '-fecha_backup',
    };

    if (this.terminoBusqueda) {
      params.search = this.terminoBusqueda;
    }

    if (this.filtroTipo) {
      params.tipo_backup = this.filtroTipo;
    }

    this.backupService.getBackups(params).subscribe({
      next: (response: ApiResponse<Backup>) => {
        this.backups = response.results;
        this.totalBackups = response.count;
        this.totalPaginas = Math.ceil(response.count / this.limitePorPagina);
        this.paginaActual = pagina;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los backups';
        this.cargando = false;
        console.error('Error loading backups:', err);
      },
    });
  }

  cargarTodosBackups(): void {
    const params: any = {
      ordering: '-fecha_backup',
    };

    if (this.terminoBusqueda) {
      params.search = this.terminoBusqueda;
    }

    if (this.filtroTipo) {
      params.tipo_backup = this.filtroTipo;
    }

    this.backupService.getBackups(params).subscribe({
      next: (response: ApiResponse<Backup>) => {
        this.todosBackups = response.results;
      },
      error: (err) => {
        console.error('Error loading all backups:', err);
      },
    });
  }

  // Búsqueda y filtros
  buscar(): void {
    this.paginaActual = 1;
    this.cargarBackups(1);
    this.cargarTodosBackups();
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarBackups(1);
    this.cargarTodosBackups();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroTipo = '';
    this.paginaActual = 1;
    this.cargarBackups(1);
    this.cargarTodosBackups();
  }

  // Paginación
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.cargarBackups(pagina);
    }
  }

  // Realizar backup
  realizarBackup(tipo: string): void {
    const backupData: BackupCreate = {
      tipo_backup: tipo,
      notas: `Backup ${tipo.toLowerCase()} realizado manualmente`,
    };

    this.backupService.realizarBackup(backupData).subscribe({
      next: (backupCreado) => {
        this.cargarBackups(this.paginaActual);
        this.cargarTodosBackups();
      },
      error: (err) => {
        this.error = 'Error al realizar el backup';
        console.error('Error creating backup:', err);
      },
    });
  }

  // Descargar backup
  descargarBackup(backup: Backup): void {
    this.backupService.downloadBackup(backup.id).subscribe({
      next: (blob) => {
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.nombre_archivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = 'Error al descargar el backup';
        console.error('Error downloading backup:', err);
      },
    });
  }

  // Modales de detalle
  verDetalle(backup: Backup): void {
    this.backupSeleccionado = backup;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.backupSeleccionado = null;
  }

  // Eliminación
  confirmarEliminar(backup: Backup): void {
    this.backupAEliminar = backup;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.backupAEliminar = null;
  }

  eliminar(): void {
    if (!this.backupAEliminar) return;

    this.backupService.deleteBackup(this.backupAEliminar.id).subscribe({
      next: () => {
        this.mostrarModalEliminar = false;
        this.backupAEliminar = null;
        this.cargarBackups(this.paginaActual);
        this.cargarTodosBackups();
      },
      error: (err) => {
        this.error = 'Error al eliminar el backup';
        this.mostrarModalEliminar = false;
        console.error('Error deleting backup:', err);
      },
    });
  }

  // Utilidades
  trackById(index: number, item: Backup): number {
    return item.id;
  }

  getTipoBadgeClass(tipo: string): string {
    const classes: { [key: string]: string } = {
      Completo: 'bg-primary',
      Incremental: 'bg-info',
      Diferencial: 'bg-warning',
    };
    return classes[tipo] || 'bg-secondary';
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: { [key: string]: string } = {
      Exitoso: 'bg-success',
      Fallido: 'bg-danger',
      'En Progreso': 'bg-warning',
    };
    return classes[estado] || 'bg-secondary';
  }

  formatearTamanio(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatearFechaHora(fechaHora: string): string {
    return new Date(fechaHora).toLocaleString('es-ES');
  }

  // Exportación
  generarReportePDF(): void {
    this.generandoReporte = true;
    setTimeout(() => {
      this.generandoReporte = false;
      alert('PDF de backups generado (funcionalidad por implementar)');
    }, 1000);
  }

  generarReporteExcel(): void {
    this.generandoReporte = true;
    setTimeout(() => {
      this.generandoReporte = false;
      alert('Excel de backups generado (funcionalidad por implementar)');
    }, 1000);
  }

  generarReporteHTML(): void {
    this.generandoReporte = true;
    setTimeout(() => {
      this.generandoReporte = false;
      alert('HTML de backups generado (funcionalidad por implementar)');
    }, 1000);
  }

  // Métodos para restore
  confirmarRestore(backup: Backup): void {
    this.backupARestorear = backup;
    this.mostrarModalRestore = true;
    this.confirmacionRestore = false;
    this.notasRestore = '';
  }

  cancelarRestore(): void {
    this.mostrarModalRestore = false;
    this.backupARestorear = null;
    this.confirmacionRestore = false;
    this.notasRestore = '';
    this.restoreEnProgreso = false;
  }

  ejecutarRestore(): void {
    if (!this.backupARestorear || !this.confirmacionRestore) return;

    this.restoreEnProgreso = true;

    // Simular proceso de restore (en producción llamarías al servicio)
    setTimeout(() => {
      this.restoreEnProgreso = false;
      this.mostrarModalRestore = false;
      this.backupARestorear = null;
      this.confirmacionRestore = false;
      this.notasRestore = '';

      // Mostrar mensaje de éxito
      alert('Base de datos restaurada exitosamente');

      // En producción, podrías redirigir al login o recargar la aplicación
      // this.router.navigate(['/login']);
    }, 3000); // Simular 3 segundos de proceso

    /*
  // Código para producción:
  this.backupService.restoreBackup(this.backupARestorear.id, this.notasRestore).subscribe({
    next: (response) => {
      this.restoreEnProgreso = false;
      this.mostrarModalRestore = false;
      this.backupARestorear = null;
      this.confirmacionRestore = false;
      this.notasRestore = '';
      
      // Redirigir al login o mostrar mensaje de éxito
      this.router.navigate(['/login'], {
        queryParams: { 
          mensaje: 'Base de datos restaurada exitosamente. Por favor inicie sesión nuevamente.',
          tipo: 'success'
        }
      });
    },
    error: (err) => {
      this.restoreEnProgreso = false;
      this.error = 'Error al restaurar la base de datos';
      console.error('Error restoring backup:', err);
    }
  });
  */
  }
}
