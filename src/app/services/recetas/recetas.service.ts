import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Receta } from '../../models/recetas/receta.model';

@Injectable({
  providedIn: 'root',
})
export class RecetasService {

  private apiUrl = `${environment.apiUrl}/recetas/`;
  private apiDetallesUrl = `${environment.apiUrl}/detalles-receta/`; 
  private apiConsultasUrl = `${environment.apiUrl}/consultas/`;

  constructor(private http: HttpClient) {}

  // =======================
  //        RECETAS
  // =======================
  getRecetas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getReceta(id: number): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}${id}/`);
  }

  createReceta(data: any): Observable<Receta> {
    return this.http.post<Receta>(this.apiUrl, data);
  }

  updateReceta(id: number, data: any): Observable<Receta> {
    return this.http.put<Receta>(`${this.apiUrl}${id}/`, data);
  }

  deleteReceta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // =======================
  //   DETALLES DE RECETA
  // =======================
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

  // =======================
  //        CONSULTAS
  // =======================
  obtenerConsultas(): Observable<any> {
    return this.http.get<any>(this.apiConsultasUrl);
  }

}
