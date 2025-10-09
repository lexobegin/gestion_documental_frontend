import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Bitacora,
  BitacoraFilters,
} from '../../models/bitacora/bitacora.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BitacoraService {
  //private apiUrl = 'http://localhost:8000/api/bitacora';
  private apiUrl = `${environment.apiUrl}/bitacora`;

  constructor(private http: HttpClient) {}

  // Para paginación
  listar(filters?: BitacoraFilters, page: number = 1): Observable<any> {
    let params = new HttpParams().set('page', page.toString());

    if (filters) {
      if (filters.modulo_afectado) {
        params = params.set('modulo_afectado', filters.modulo_afectado);
      }
      if (filters.usuario) {
        params = params.set('usuario', filters.usuario.toString());
      }
      if (filters.fecha_desde) {
        params = params.set('fecha_desde', filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        params = params.set('fecha_hasta', filters.fecha_hasta);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Para exportación (sin paginación)
  listarTodos(filters?: BitacoraFilters): Observable<Bitacora[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.modulo_afectado) {
        params = params.set('modulo_afectado', filters.modulo_afectado);
      }
      if (filters.usuario) {
        params = params.set('usuario', filters.usuario.toString());
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }
    return this.http
      .get<any>(this.apiUrl, { params })
      .pipe(map((response: any) => response?.results || response || []));
  }

  // Para detalles
  getDetalleCompleto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/detalle-completo/`);
  }

  // Original (compatibilidad)
  getBitacora(filters?: BitacoraFilters): Observable<Bitacora[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.modulo_afectado)
        params = params.set('modulo_afectado', filters.modulo_afectado);
      if (filters.usuario)
        params = params.set('usuario', filters.usuario.toString());
      if (filters.fecha_desde)
        params = params.set('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta)
        params = params.set('fecha_hasta', filters.fecha_hasta);
      if (filters.search) params = params.set('search', filters.search);
    }
    return this.http
      .get<any>(this.apiUrl, { params })
      .pipe(map((response: any) => response?.results || response || []));
  }

  getBitacoraById(id: number): Observable<Bitacora> {
    return this.http.get<Bitacora>(`${this.apiUrl}/${id}/`);
  }
}
