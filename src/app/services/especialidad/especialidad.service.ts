import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Especialidad,
  EspecialidadCreate,
  EspecialidadUpdate,
  ApiResponse,
  PaginationParams,
} from '../../models/especialidad/especialidad.model';

@Injectable({
  providedIn: 'root',
})
export class EspecialidadService {
  private apiUrl = `${environment.apiUrl}/especialidades/`;

  constructor(private http: HttpClient) {}

  // Obtener lista paginada de especialidades
  getEspecialidades(
    params?: PaginationParams
  ): Observable<ApiResponse<Especialidad>> {
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

    return this.http.get<ApiResponse<Especialidad>>(this.apiUrl, {
      params: httpParams,
    });
  }

  // Obtener todas las especialidades (sin paginación para selects, etc.)
  getAllEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.apiUrl}?limit=1000`);
  }

  // Obtener una especialidad por ID
  getEspecialidadById(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.apiUrl}${id}/`);
  }

  // Crear nueva especialidad
  createEspecialidad(
    especialidad: EspecialidadCreate
  ): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.apiUrl, especialidad);
  }

  // Actualizar especialidad existente
  updateEspecialidad(
    id: number,
    especialidad: EspecialidadUpdate
  ): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.apiUrl}${id}/`, especialidad);
  }

  // Eliminar especialidad
  deleteEspecialidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  // Verificar si una especialidad puede ser eliminada
  canDeleteEspecialidad(
    id: number
  ): Observable<{ can_delete: boolean; message?: string }> {
    return this.http.get<{ can_delete: boolean; message?: string }>(
      `${this.apiUrl}${id}/can-delete/`
    );
  }

  // Buscar especialidades
  searchEspecialidades(term: string): Observable<Especialidad[]> {
    const params = new HttpParams().set('search', term);
    return this.http.get<Especialidad[]>(this.apiUrl, { params });
  }
}
