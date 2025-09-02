import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Auto } from '../../models/auto/auto.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AutoService {
  private baseUrl = `${environment.apiUrl}/autos/`;

  constructor(private http: HttpClient, private router: Router) {}

  // Obtener todos los autos
  /*obtenerAutos(): Observable<Auto[]> {
    return this.http.get<Auto[]>(this.baseUrl);
  }*/

  // Obtener todos los autos con paginacion
  obtenerAutos(page: number = 1, search: string = ''): Observable<any> {
    const params = [];

    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');
    return this.http.get<any>(`${this.baseUrl}?${queryString}`);
  }

  // Obtener un auto por ID
  obtenerAutoPorId(id: number): Observable<Auto> {
    return this.http.get<Auto>(`${this.baseUrl}${id}/`);
  }

  // Crear un auto
  crearAuto(auto: Auto): Observable<Auto> {
    return this.http.post<Auto>(this.baseUrl, auto);
  }

  // Actualizar un auto
  actualizarAuto(id: number, auto: Auto): Observable<Auto> {
    return this.http.put<Auto>(`${this.baseUrl}${id}/`, auto);
  }

  // Eliminar un auto
  eliminarAuto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${id}/`);
  }
}
