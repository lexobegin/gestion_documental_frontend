import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../models/usuario/usuario.model';

/** Payload para crear (el back exige id_rol y password) */
export interface CreateUsuarioDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  activo: boolean;
  id_rol: number;
  password: string; // requerido para crear
}

/** Payload para actualizar; password es opcional (si viene, se setea) */
export interface UpdateUsuarioDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  activo?: boolean;
  id_rol?: number;
  password?: string; // opcional para update
}

/** (Opcional) Helper solo para cambiar contraseña */
export interface ChangePasswordDto {
  password: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private baseUrl = `${environment.apiUrl}/usuarios/`; // ej: http://localhost:8000/api/usuarios/

  constructor(private http: HttpClient) {}

  /** Listado; acepta params opcionales (paginación, búsqueda, etc.) */
  listar(params?: { page?: number; page_size?: number; search?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.page_size) httpParams = httpParams.set('page_size', params.page_size);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<any>(this.baseUrl, { params: httpParams });
  }

  /** Obtener detalle */
  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}${id}/`);
  }

  /** Crear usuario (con password) */
  crear(dto: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, dto);
  }

  /** Reemplazo completo (PUT). Usa UpdateUsuarioDto por si no quieres enviar todos los campos del modelo */
  actualizar(id: number, dto: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}${id}/`, dto);
  }

  /** Actualización parcial (PATCH) — útil para editar pocos campos o cambiar solo el rol/estado */
  actualizarParcial(id: number, dto: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}${id}/`, dto);
  }

  /** Eliminar */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }

  /** (Opcional) Cambiar solo la contraseña del usuario */
  cambiarPassword(id: number, dto: ChangePasswordDto): Observable<Usuario> {
    // Si tu backend no tiene un endpoint dedicado (p.ej. /usuarios/{id}/password/),
    // puedes reutilizar PATCH y enviar solo { password: '...' }:
    return this.http.patch<Usuario>(`${this.baseUrl}${id}/`, dto);
  }
}
