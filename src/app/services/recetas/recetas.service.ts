import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Receta, DetalleReceta } from '../../models/recetas/receta.model';

@Injectable({
  providedIn: 'root',
})
export class RecetasService {
  private apiUrl = `${environment.apiUrl}/recetas/`;
  private apiDetalleUrl = `${environment.apiUrl}/detalles-recetas/`;
  private apiConsultasUrl = `${environment.apiUrl}/consultas/`; 

  constructor(private http: HttpClient) {}

  // ======= CRUD Recetas =======
  getRecetas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getReceta(id: number): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}${id}/`);
  }

  createReceta(data: Receta): Observable<Receta> {
    return this.http.post<Receta>(this.apiUrl, data);
  }

  updateReceta(id: number, data: Receta): Observable<Receta> {
    return this.http.put<Receta>(`${this.apiUrl}${id}/`, data);
  }

  deleteReceta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // ======= CRUD Detalles =======
  getDetalles(idReceta: number): Observable<DetalleReceta[]> {
    return this.http.get<DetalleReceta[]>(`${this.apiDetalleUrl}?id_receta=${idReceta}`);
  }

  createDetalle(data: DetalleReceta): Observable<DetalleReceta> {
    return this.http.post<DetalleReceta>(this.apiDetalleUrl, data);
  }

  deleteDetalle(id: number): Observable<any> {
    return this.http.delete(`${this.apiDetalleUrl}${id}/`);
  }

  // ======= Consultas (para selector de receta) =======
  obtenerConsultas(): Observable<any> {
    return this.http.get<any>(this.apiConsultasUrl);
  }
}