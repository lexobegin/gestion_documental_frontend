import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs'; // <-- AGREGAR map aquí
import { environment } from '../../../environments/environment';
import {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
  UsuarioFiltros,
  Page,
} from '../../models/usuario/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private baseUrl = `${environment.apiUrl}/usuarios/`;

  constructor(private http: HttpClient) {}

  /** Listado con paginación y filtros */
  listar(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    rol?: string;
    activo?: string;
  }): Observable<Page<Usuario>> {
    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.page_size)
      httpParams = httpParams.set('page_size', params.page_size);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.rol) httpParams = httpParams.set('rol', params.rol);
    if (params?.activo) httpParams = httpParams.set('activo', params.activo);

    return this.http.get<Page<Usuario>>(this.baseUrl, { params: httpParams });
  }

  /** Obtener todos los usuarios sin paginación (para exportar) */
  listarTodos(filtros?: UsuarioFiltros): Observable<Usuario[]> {
    let httpParams = new HttpParams();

    // Usar page_size grande para obtener todos los registros
    httpParams = httpParams.set('page_size', '1000');

    if (filtros?.search) httpParams = httpParams.set('search', filtros.search);
    if (filtros?.rol) httpParams = httpParams.set('rol', filtros.rol);
    if (filtros?.activo) httpParams = httpParams.set('activo', filtros.activo);

    return this.http
      .get<Page<Usuario>>(this.baseUrl, { params: httpParams })
      .pipe(map((response: Page<Usuario>) => response.results || []));
  }

  /** Obtener detalle */
  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}${id}/`);
  }

  /** Crear usuario */
  crear(dto: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, dto);
  }

  /** Actualización completa */
  actualizar(id: number, dto: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}${id}/`, dto);
  }

  /** Actualización parcial */
  actualizarParcial(id: number, dto: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}${id}/`, dto);
  }

  /** Eliminar */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }

  /** Cambiar contraseña */
  cambiarPassword(id: number, dto: ChangePasswordDto): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}${id}/`, dto);
  }
}
