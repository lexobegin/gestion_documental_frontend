import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Modelo principal de examen médico */
export interface ExamenMedico {
  id: number;
  consulta: number;
  tipo_examen: number;
  tipo_examen_nombre: string;
  urgencia: string;
  estado: string;
  fecha_solicitud: string;
  fecha_resultado?: string;
  resultados?: string;
  observaciones?: string;
}

/** Payload para crear examen */
export interface ExamenCrear {
  consulta: number;
  tipo_examen: number;
  urgencia?: string;
  indicaciones_especificas?: string;
}

@Injectable({ providedIn: 'root' })
export class ExamenMedicoService {
  /** Endpoint base para solicitudes */
  private apiUrlSolicitudes = `${environment.apiUrl}/solicitudes-examen/`;
  /** Endpoint base para tipos */
  private apiUrlTipos = `${environment.apiUrl}/tipos-examen/`;

  constructor(private http: HttpClient) {}

  /** 🧾 Listar exámenes por consulta */
  getExamenesPorConsulta(consultaId: number): Observable<ExamenMedico[]> {
    return this.http.get<ExamenMedico[]>(
      `${this.apiUrlSolicitudes}por-consulta/${consultaId}/`
    );
  }

  /** 🧪 Crear examen (usa endpoint solicitar-desde-consulta) */
  crearExamen(data: ExamenCrear): Observable<ExamenMedico> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      alert('⚠️ No se encontró el token de autenticación. Inicia sesión nuevamente.');
      throw new Error('Token no encontrado');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
    });

    console.log('POST →', `${this.apiUrlSolicitudes}solicitar-desde-consulta/`, data);

    return this.http.post<ExamenMedico>(
      `${this.apiUrlSolicitudes}solicitar-desde-consulta/`,
      data,
      { headers }
    );
  }

  /** 📋 Obtener tipos de examen activos para select */
  getTiposExamenSelect(): Observable<{ id: number; nombre: string }[]> {
    return this.http.get<{ id: number; nombre: string }[]>(
      `${environment.apiUrl}/select/tipos-examen/`
    );
  }

  /** 🗑️ Eliminar un tipo de examen */
  eliminarTipoExamen(id: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token.trim()}` })
      : undefined;

    return this.http.delete(`${this.apiUrlTipos}${id}/`, { headers });
  }

  /** 🗑️ Eliminar una solicitud de examen */
  eliminarSolicitudExamen(id: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token.trim()}` })
      : undefined;

    return this.http.delete(`${this.apiUrlSolicitudes}${id}/`, { headers });
  }
}
