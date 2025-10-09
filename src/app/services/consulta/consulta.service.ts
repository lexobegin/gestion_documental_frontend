import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Consulta {
  paciente: number;
  motivo_consulta: string;
  sintomas?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  //private apiUrl = 'http://localhost:8000/api/consultas/'; // ajusta tu endpoint
  private apiUrl = `${environment.apiUrl}/consultas/`;

  constructor(private http: HttpClient) {}

  crearConsulta(data: Consulta): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  listarConsultas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
