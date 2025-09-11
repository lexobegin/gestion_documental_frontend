import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class RolService {
  private baseUrl = `${environment.apiUrl}/roles/`; // p.ej: http://localhost:8000/api/roles/

  constructor(private http: HttpClient) {}

  list(): Observable<Rol[]> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` }) // <-- si usas DRF SimpleJWT
      // : new HttpHeaders({ Authorization: `Token ${token}` }) // <-- si usas DRF TokenAuth
      : undefined;

    return this.http.get<any>(this.baseUrl, { headers }).pipe(
      map((res: any) => {
        // Soporta array directo o formato paginado DRF
        const arr = Array.isArray(res) ? res : (res?.results ?? []);

        // Normaliza nombres de campos (id/nombre pueden venir distintos)
        const roles: Rol[] = arr.map((r: any) => ({
          id:
            r.id ??
            r.id_rol ??
            r.pk ??
            Number(r.value) ?? // por si viene value/text
            null,
          nombre:
            r.nombre ??
            r.nombre_rol ??
            r.role_name ??
            r.text ??
            r.name ??
            'Sin nombre',
          descripcion: r.descripcion ?? r.description ?? undefined
        }));

        // Filtra nulos por seguridad
        return roles.filter(x => typeof x.id === 'number' && !!x.nombre);
      })
    );
  }
}
