import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Notificacion,
  CreateNotificacionDto,
  UpdateNotificacionDto,
  NotificacionFiltros,
  Page,
} from '../../models/notificacion/notificacion.model';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private baseUrl = `${environment.apiUrl}/notificaciones/`;

  constructor(private http: HttpClient) {}

  /** Listado con paginación y filtros */
  listar(params?: {
    page?: number;
    page_size?: number;
    tipo?: string;
    leida?: string;
    search?: string;
  }): Observable<Page<Notificacion>> {
    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.page_size)
      httpParams = httpParams.set('page_size', params.page_size);
    if (params?.tipo) httpParams = httpParams.set('tipo', params.tipo);
    if (params?.leida) httpParams = httpParams.set('leida', params.leida);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<Page<Notificacion>>(this.baseUrl, {
      params: httpParams,
    });
  }

  /** Obtener todas las notificaciones sin paginación (para exportar) */
  listarTodos(filtros?: NotificacionFiltros): Observable<Notificacion[]> {
    let httpParams = new HttpParams();

    // Usar page_size grande para obtener todos los registros
    httpParams = httpParams.set('page_size', '1000');

    if (filtros?.tipo) httpParams = httpParams.set('tipo', filtros.tipo);
    if (filtros?.leida) httpParams = httpParams.set('leida', filtros.leida);
    if (filtros?.search) httpParams = httpParams.set('search', filtros.search);

    return this.http
      .get<Page<Notificacion>>(this.baseUrl, { params: httpParams })
      .pipe(map((response: Page<Notificacion>) => response.results || []));
  }

  /** Obtener detalle */
  obtener(id: number): Observable<Notificacion> {
    return this.http.get<Notificacion>(`${this.baseUrl}${id}/`);
  }

  /** Crear notificación */
  crear(dto: CreateNotificacionDto): Observable<Notificacion> {
    return this.http.post<Notificacion>(this.baseUrl, dto);
  }

  /** Actualización completa */
  actualizar(id: number, dto: UpdateNotificacionDto): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.baseUrl}${id}/`, dto);
  }

  /** Actualización parcial */
  actualizarParcial(
    id: number,
    dto: UpdateNotificacionDto
  ): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.baseUrl}${id}/`, dto);
  }

  /** Eliminar */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }

  /** Endpoints específicos de notificaciones */

  /** Marcar una notificación como leída */
  marcarLeida(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}${id}/marcar-leida/`, {});
  }

  /** Marcar todas las notificaciones como leídas */
  marcarTodasLeidas(): Observable<any> {
    return this.http.post(`${this.baseUrl}marcar-todas-leidas/`, {});
  }

  /** Obtener notificaciones no leídas */
  obtenerNoLeidas(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.baseUrl}no-leidas/`);
  }
}
