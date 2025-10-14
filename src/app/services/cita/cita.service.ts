import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Cita,
  CitaCreate,
  CitaUpdate,
  ApiResponse,
  PaginationParams,
} from '../../models/cita/cita.model';

export interface PacienteSelect {
  usuario: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    nombre_completo: string;
  };
  nombre_completo: string;
  email: string;
  estado: string;
  tipo_sangre: string;
}

export interface MedicoEspecialidadSelect {
  id: number;
  medico: number;
  medico_nombre_completo: string;
  especialidad: number;
  especialidad_nombre: string;
  especialidad_codigo: string;
}

export interface HorariosDisponibles {
  horas_disponibles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/agenda-citas/`;
  private selectUrl = `${environment.apiUrl}/select/`;

  constructor(private http: HttpClient) {}

  // Obtener lista paginada de citas
  getCitas(params?: PaginationParams): Observable<ApiResponse<Cita>> {
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params?.ordering) {
      httpParams = httpParams.set('ordering', params.ordering);
    }

    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }

    if (params?.medico) {
      httpParams = httpParams.set('medico', params.medico.toString());
    }

    if (params?.paciente) {
      httpParams = httpParams.set('paciente', params.paciente.toString());
    }

    if (params?.fecha_cita) {
      httpParams = httpParams.set('fecha_cita', params.fecha_cita);
    }
    //console.log('URL: ', httpParams);

    return this.http.get<ApiResponse<Cita>>(this.apiUrl, {
      params: httpParams,
    });
  }

  // Obtener una cita por ID
  getCitaById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}${id}/`);
  }

  // Crear nueva cita
  createCita(cita: CitaCreate): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  // Actualizar cita existente
  updateCita(id: number, cita: CitaUpdate): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}${id}/`, cita);
  }

  // Cambiar estado de cita
  cambiarEstadoCita(id: number, estado: string): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}${id}/cambiar-estado/`, {
      estado,
    });
  }

  // En el método updateCita, podrías agregar manejo específico para conflictos de horario
  updateCitaCalendar(id: number, cita: CitaUpdate): Observable<Cita> {
    console.log('cita-service: ', cita);

    return this.http.patch<Cita>(`${this.apiUrl}${id}/`, cita).pipe(
      catchError((error) => {
        if (error.status === 400 && error.error?.non_field_errors) {
          // Manejar errores de validación del backend
          throw new Error(
            'Conflicto de horario: ' + error.error.non_field_errors.join(', ')
          );
        }
        throw error;
      })
    );
  }

  // En cita.service.ts
  getHorasDisponibles(
    medicoEspecialidadId: number,
    fecha: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}horas-disponibles/?medico_especialidad=${medicoEspecialidadId}&fecha=${fecha}`
    );
  }

  // Eliminar cita
  deleteCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  // Obtener citas del médico actual
  getMisCitas(params?: PaginationParams): Observable<ApiResponse<Cita>> {
    return this.getCitas(params);
  }

  // Nuevos métodos para los selects
  buscarPacientes(search?: string): Observable<PacienteSelect[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PacienteSelect[]>(`${this.selectUrl}pacientes/`, {
      params,
    });
  }

  buscarMedicoEspecialidades(
    search?: string
  ): Observable<MedicoEspecialidadSelect[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<MedicoEspecialidadSelect[]>(
      `${this.selectUrl}medico-especialidades/`,
      { params }
    );
  }

  obtenerHorariosDisponibles(
    medicoEspecialidadId: number,
    fecha: string
  ): Observable<HorariosDisponibles> {
    let params = new HttpParams()
      .set('medico_especialidad', medicoEspecialidadId.toString())
      .set('fecha', fecha);

    return this.http.get<HorariosDisponibles>(
      `${this.apiUrl}horas-disponibles/`,
      { params }
    );
  }
}
