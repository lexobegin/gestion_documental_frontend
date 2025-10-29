import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Consulta, ConsultaCreate, ConsultaListResponse } from '../../models/consulta/consulta.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  // ✅ Endpoints reales de tu backend
  private apiUrl = `${environment.apiUrl}/consultas/`;
  private apiUrlSimple = `${environment.apiUrl}/crear-consulta-simple/`;

  constructor(private http: HttpClient) {}

  // ==================== CRUD ====================

  /** 🔹 Listar todas las consultas (con paginación y filtros opcionales) */
  getConsultas(filters?: any, page: number = 1, pageSize: number = 10): Observable<ConsultaListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ConsultaListResponse>(this.apiUrl, { params });
  }

  /** 🔹 Obtener una consulta específica */
  getConsulta(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.apiUrl}${id}/`);
  }

  /** 🔹 Crear consulta (endpoint simple) */
  createConsulta(consulta: ConsultaCreate): Observable<Consulta> {
    return this.http.post<Consulta>(this.apiUrlSimple, consulta);
  }

  /** 🔹 Actualizar una consulta */
  updateConsulta(id: number, consulta: Consulta): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.apiUrl}${id}/`, consulta);
  }

  /** 🔹 Eliminar una consulta */
  deleteConsulta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  // ==================== MÉTODOS EXTRA ====================

  /** 🧮 Calcular IMC */
  calcularIMC(peso: number, altura: number): number {
    if (!peso || !altura || altura === 0) return 0;
    return Number((peso / (altura * altura)).toFixed(2));
  }

  /** ✅ Validar los datos antes de enviar la consulta */
  validarConsulta(consulta: ConsultaCreate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!consulta.motivo_consulta?.trim()) {
      errors.push('El motivo de la consulta es obligatorio.');
    }

    if (!consulta.paciente_email?.trim()) {
      errors.push('Debe indicar el email del paciente.');
    }

    if (consulta.peso && consulta.peso <= 0) {
      errors.push('El peso debe ser mayor que 0.');
    }

    if (consulta.altura && consulta.altura <= 0) {
      errors.push('La altura debe ser mayor que 0.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
