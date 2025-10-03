import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Permiso {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class PermisoService {
    private baseUrl = `${environment.apiUrl}/permisos/`;

    constructor(private http: HttpClient) { }

    create(data: { nombre: string; codigo: string; descripcion?: string }): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : undefined;
        return this.http.post(this.baseUrl, data, { headers });
    }
}
