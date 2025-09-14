
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especialidad } from '../../models/especialidades_alison/especialidades.model';

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private baseUrl = `${environment.apiUrl}/especialidades/`; // DRF: barra final

  constructor(private http: HttpClient) {}

  list(params?: { search?: string; page?: number; page_size?: number }): Observable<Paginated<Especialidad> | Especialidad[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get<Paginated<Especialidad> | Especialidad[]>(this.baseUrl, { params: httpParams });
  }

  get(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.baseUrl}${id}/`);
  }

  create(payload: Omit<Especialidad, 'id'>): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.baseUrl, payload);
  }

  update(id: number, payload: Omit<Especialidad, 'id'>): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.baseUrl}${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}

