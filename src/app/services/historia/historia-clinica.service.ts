import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HistoriaClinica {
  id: number;
  paciente: number;
  paciente_nombre: string;
  paciente_apellido: string;
  fecha_creacion: string;
  observaciones_generales: string;
  activo: boolean;
}

export interface HistoriaClinicaCreate {
  paciente: number;
  observaciones_generales?: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HistoriaClinicaService {
  private apiUrl = `${environment.apiUrl}/historias-clinicas/`;

  constructor(private http: HttpClient) {}

  getHistoriasByPaciente(pacienteId: number): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/historias-clinicas/paciente/${pacienteId}/`
    );
  }

  createHistoriaClinica(
    historia: HistoriaClinicaCreate
  ): Observable<HistoriaClinica> {
    console.log('Enviando al servidor:', historia);
    return this.http.post<HistoriaClinica>(this.apiUrl, historia);
  }

  getHistoriasClinicas(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.paciente) {
      httpParams = httpParams.set('paciente', params.paciente.toString());
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  // Agregar método para obtener historias sin filtrar por activo
  getAllHistoriasByPaciente(pacienteId: number): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/historias-clinicas/?paciente=${pacienteId}`
    );
  }
}
