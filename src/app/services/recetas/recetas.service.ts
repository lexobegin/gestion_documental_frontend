import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Receta } from '../../models/recetas/receta.model';

@Injectable({
  providedIn: 'root'
})
export class RecetasService {

  private apiUrl = `${environment.apiUrl}/recetas/`;
  private apiDetallesUrl = `${environment.apiUrl}/detalles-receta/`; 
  private apiConsultasUrl = `${environment.apiUrl}/consultas/`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      'Content-Type': 'application/json',
    });
  }

  // ==================== RECETAS ====================

  getRecetas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getRecetasPorConsulta(consultaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?consulta=${consultaId}`, {
      headers: this.getHeaders()
    });
  }

  getRecetaById(id: number): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}${id}/`, {
      headers: this.getHeaders()
    });
  }

  createReceta(data: any): Observable<Receta> {
    return this.http.post<Receta>(this.apiUrl, data);
  }

  updateReceta(id: number, data: any): Observable<Receta> {
    return this.http.put<Receta>(`${this.apiUrl}${id}/`, data);
  }

  eliminarReceta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`, {
      headers: this.getHeaders()
    });
  }

  // ======================= DETALLES =======================

  createDetalle(data: any): Observable<any> {
    return this.http.post(this.apiDetallesUrl, data);
  }

  updateDetalle(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiDetallesUrl}${id}/`, data);
  }

  deleteDetalle(id: number): Observable<any> {
    return this.http.delete(`${this.apiDetallesUrl}${id}/`);
  }

  getDetallesByReceta(recetaId: number): Observable<any> {
    return this.http.get(`${this.apiDetallesUrl}?receta=${recetaId}`);
  }

  // ======================= CONSULTAS =======================

  obtenerConsultas(): Observable<any> {
    return this.http.get<any>(this.apiConsultasUrl);
  }
}
