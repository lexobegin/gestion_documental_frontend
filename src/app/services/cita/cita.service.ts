import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Cita,
  CitaCreate,
  CitaUpdate,
  ApiResponse,
  PaginationParams,
} from '../../models/cita/cita.model';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/agenda-citas/`;

  constructor(private http: HttpClient) {}

  // Obtener lista paginada de citas
  getCitas(params?: PaginationParams): Observable<ApiResponse<Cita>> {
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

    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }

    if (params?.medico) {
      httpParams = httpParams.set('medico', params.medico.toString());
    }

    if (params?.paciente) {
      httpParams = httpParams.set('paciente', params.paciente.toString());
    }

    if (params?.fecha_cita) {
      httpParams = httpParams.set('fecha_cita', params.fecha_cita);
    }
    //console.log('URL: ', httpParams);

    return this.http.get<ApiResponse<Cita>>(this.apiUrl, {
      params: httpParams,
    });
  }

  // Obtener una cita por ID
  getCitaById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}${id}/`);
  }

  // Crear nueva cita
  createCita(cita: CitaCreate): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  // Actualizar cita existente
  updateCita(id: number, cita: CitaUpdate): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}${id}/`, cita);
  }

  // Cambiar estado de cita
  cambiarEstadoCita(id: number, estado: string): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}${id}/cambiar-estado/`, {
      estado,
    });
  }

  // Eliminar cita
  deleteCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  // Obtener citas del médico actual
  getMisCitas(params?: PaginationParams): Observable<ApiResponse<Cita>> {
    return this.getCitas(params);
  }
}
