import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paciente, PacienteFiltros } from '../../models/paciente/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private baseUrl = `${environment.apiUrl}/pacientes/`;

  constructor(private http: HttpClient) {}

  /** Listado con paginación y filtros */
  listar(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    genero?: string;
    estado?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.genero) httpParams = httpParams.set('genero', params.genero);
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);

    return this.http.get<any>(this.baseUrl, { params: httpParams });
  }

  /** Obtener todos los pacientes sin paginación (para exportar) */
  listarTodos(filtros?: PacienteFiltros): Observable<Paciente[]> {
    let httpParams = new HttpParams();

    httpParams = httpParams.set('page_size', '1000');

    if (filtros?.search) httpParams = httpParams.set('search', filtros.search);
    if (filtros?.genero) httpParams = httpParams.set('genero', filtros.genero);
    if (filtros?.estado) httpParams = httpParams.set('estado', filtros.estado);

    return this.http
      .get<any>(this.baseUrl, { params: httpParams })
      .pipe(
        map((response: any) => {
          if (response.results && response.results.length > 0) {
            return response.results.map((paciente: any) => this.mapearPacienteDesdeBackend(paciente));
          }
          return [];
        })
      );
  }

  /** Obtener detalle */
  obtener(id: number): Observable<Paciente> {
    return this.http.get<any>(`${this.baseUrl}${id}/`).pipe(
      map((paciente: any) => this.mapearPacienteDesdeBackend(paciente))
    );
  }

  /** Crear paciente */
  crear(paciente: any): Observable<Paciente> {
    return this.http.post<Paciente>(this.baseUrl, paciente);
  }

  /** Actualización completa */
  actualizar(id: number, paciente: any): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.baseUrl}${id}/`, paciente);
  }

  /** Actualización parcial */
  actualizarParcial(id: number, datos: any): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.baseUrl}${id}/`, datos);
  }

  /** Eliminar */
  /*eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }*/

    /** Eliminar paciente (y usuario asociado en backend) */
  eliminar(id: number): Observable<void> {
    const url = `${this.baseUrl}${id}/`;
    console.log('Enviando solicitud DELETE a:', url);

    // Retorna directamente el observable de HttpClient
    return this.http.delete<void>(url).pipe(
      map(() => {
        console.log('Paciente eliminado correctamente (backend confirmó)');
      })
    );
  }


  /** NUEVO: Mapear paciente desde backend incluyendo nombre y apellido */
  private mapearPacienteDesdeBackend(paciente: any): Paciente {
    const nombreCompleto = paciente.nombre_completo || '';
    const { nombre, apellido } = this.extraerNombreYApellido(nombreCompleto);

    return {
      id: paciente.usuario?.id, // Paciente usa el ID del usuario
      usuario: paciente.usuario,
      nombre,
      apellido,
      password: '',
      nombre_completo: nombreCompleto,
      email: paciente.email,
      telefono: paciente.telefono,
      direccion: paciente.direccion,
      fecha_nacimiento: paciente.fecha_nacimiento,
      genero: paciente.genero,
      tipo_sangre: paciente.tipo_sangre,
      alergias: paciente.alergias,
      enfermedades_cronicas: paciente.enfermedades_cronicas,
      medicamentos_actuales: paciente.medicamentos_actuales,
      contacto_emergencia_nombre: paciente.contacto_emergencia_nombre,
      contacto_emergencia_telefono: paciente.contacto_emergencia_telefono,
      contacto_emergencia_parentesco: paciente.contacto_emergencia_parentesco,
      estado: paciente.estado,
      fecha_creacion: paciente.fecha_creacion,
      fecha_actualizacion: paciente.fecha_actualizacion
    };
  }

  /** NUEVO: Extraer nombre y apellido desde nombre_completo */
  private extraerNombreYApellido(nombreCompleto: string): { nombre: string, apellido: string } {
    if (!nombreCompleto) return { nombre: '', apellido: '' };
    
    const partes = nombreCompleto.trim().split(' ').filter(part => part.length > 0);
    
    if (partes.length === 0) return { nombre: '', apellido: '' };
    if (partes.length === 1) return { nombre: partes[0], apellido: '' };
    
    const nombre = partes[0];
    const apellido = partes.slice(1).join(' ');
    
    return { nombre, apellido };
  }
}