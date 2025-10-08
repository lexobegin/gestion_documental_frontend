import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Backup,
  BackupCreate,
  ApiResponse,
  PaginationParams,
} from '../../models/backup/backup.model';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private apiUrl = `${environment.apiUrl}/backups/`;

  constructor(private http: HttpClient) {}

  // Obtener lista paginada de backups
  getBackups(params?: PaginationParams): Observable<ApiResponse<Backup>> {
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params?.ordering) {
      httpParams = httpParams.set('ordering', params.ordering);
    }

    if (params?.tipo_backup) {
      httpParams = httpParams.set('tipo_backup', params.tipo_backup);
    }

    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }

    if (params?.usuario_responsable) {
      httpParams = httpParams.set(
        'usuario_responsable',
        params.usuario_responsable.toString()
      );
    }

    return this.http.get<ApiResponse<Backup>>(this.apiUrl, {
      params: httpParams,
    });
  }

  // Obtener un backup por ID
  getBackupById(id: number): Observable<Backup> {
    return this.http.get<Backup>(`${this.apiUrl}${id}/`);
  }

  // Realizar backup manual
  realizarBackup(backupData: BackupCreate): Observable<Backup> {
    return this.http.post<Backup>(`${this.apiUrl}realizar-backup/`, backupData);
  }

  // Eliminar backup
  deleteBackup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  // Descargar backup (si la API lo permite)
  downloadBackup(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${id}/descargar/`, {
      responseType: 'blob',
    });
  }

  // Agregar este método en el servicio
  restoreBackup(id: number, notas?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}${id}/restore/`, { notas });
  }

  // Restaurar desde backup existente
  restoreBackupp(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}${id}/restore/`, {});
  }

  // Restaurar desde archivo
  restoreFromFile(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('backup_file', archivo);
    return this.http.post(`${this.apiUrl}restore-from-file/`, formData);
  }

  // Verificar backup
  verificarBackup(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${id}/verificar/`);
  }
}
