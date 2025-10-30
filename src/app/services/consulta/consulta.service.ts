import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Consulta,
  ConsultaCreate,
  ConsultaUpdate,
  ApiResponse,
  PaginationParams,
} from '../../models/consulta/consulta.model';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private apiUrl = `${environment.apiUrl}/consultas/`;

  constructor(private http: HttpClient) {}

  // Obtener lista paginada de consultas
  getConsultas(params?: PaginationParams): Observable<ApiResponse<Consulta>> {
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

    if (params?.historia_clinica) {
      httpParams = httpParams.set(
        'historia_clinica',
        params.historia_clinica.toString()
      );
    }

    if (params?.medico) {
      httpParams = httpParams.set('medico', params.medico.toString());
    }

    return this.http.get<ApiResponse<Consulta>>(this.apiUrl, {
      params: httpParams,
    });
  }

  // Obtener una consulta por ID
  getConsultaById(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.apiUrl}${id}/`);
  }

  // Crear nueva consulta
  createConsulta(consulta: ConsultaCreate): Observable<Consulta> {
    return this.http.post<Consulta>(this.apiUrl, consulta);
  }

  // Actualizar consulta existente
  updateConsulta(id: number, consulta: ConsultaUpdate): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.apiUrl}${id}/`, consulta);
  }

  // Eliminar consulta
  deleteConsulta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
