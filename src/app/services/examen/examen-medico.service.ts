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

  // Datos del paciente
  paciente_nombre?: string;
  paciente_apellido?: string;

  // Datos del médico
  medico_nombre?: string;
  medico_apellido?: string;
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

  // =========================================================
  //  LISTAR EXÁMENES POR CONSULTA ESPECÍFICA
  // =========================================================
  getExamenesPorConsulta(consultaId: number): Observable<ExamenMedico[]> {
    return this.http.get<ExamenMedico[]>(
      `${this.apiUrlSolicitudes}por-consulta/${consultaId}/`
    );
  }

  // =========================================================
  //  LISTAR EXÁMENES DEL MÉDICO LOGUEADO
  // =========================================================
  getExamenesMedico(): Observable<any> {
    const token = localStorage.getItem('auth_token');

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token.trim()}` })
      : undefined;

    // El backend ya filtra automáticamente por médico
    return this.http.get<ExamenMedico[]>(this.apiUrlSolicitudes, { headers });
  }

  // =========================================================
  //  CREAR EXAMEN (solicitar examen desde consulta)
  // =========================================================
  crearExamen(data: ExamenCrear): Observable<ExamenMedico> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      alert('No se encontró el token de autenticación. Inicia sesión nuevamente.');
      throw new Error('Token no encontrado');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<ExamenMedico>(
      `${this.apiUrlSolicitudes}solicitar-desde-consulta/`,
      data,
      { headers }
    );
  }

  // =========================================================
  //  REGISTRAR RESULTADO DE EXAMEN
  // =========================================================
  registrarResultado(
    id: number,
    data: { resultados: string; observaciones?: string }
  ): Observable<ExamenMedico> {

    const token = localStorage.getItem('auth_token');

    if (!token) {
      alert('No se encontró el token de autenticación. Inicia sesión nuevamente.');
      throw new Error('Token no encontrado');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<ExamenMedico>(
      `${this.apiUrlSolicitudes}${id}/registrar-resultado/`,
      data,
      { headers }
    );
  }

  // =========================================================
  //  TIPOS DE EXAMEN (lista para selects)
  // =========================================================
  getTiposExamenSelect(): Observable<{ id: number; nombre: string }[]> {
    return this.http.get<{ id: number; nombre: string }[]>(
      `${environment.apiUrl}/select/tipos-examen/`
    );
  }

  // =========================================================
  //  ELIMINAR TIPO DE EXAMEN
  // =========================================================
  eliminarTipoExamen(id: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token.trim()}` })
      : undefined;

    return this.http.delete(`${this.apiUrlTipos}${id}/`, { headers });
  }

  // =========================================================
  //  ELIMINAR SOLICITUD DE EXAMEN
  // =========================================================
  eliminarSolicitudExamen(id: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token.trim()}` })
      : undefined;

    return this.http.delete(`${this.apiUrlSolicitudes}${id}/`, { headers });
  }

  // =========================================================
  //  DESCARGAR PDF
  // =========================================================
  descargarPDFGeneral() {
  const token = localStorage.getItem('auth_token');

  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token.trim()}` })
    : undefined;

  return this.http.get(
    `${this.apiUrlSolicitudes}reporte-pdf/`,
    {
      headers,
      responseType: 'blob'
    }
  );
}

}
