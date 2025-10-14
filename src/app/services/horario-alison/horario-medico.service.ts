import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HorarioMedico } from '../../models/horario-alison/horario-medico.model';
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class HorarioMedicoService {

  // Usamos la URL del environment (local o producción según el build)
  private apiUrl = `${environment.apiUrl}/horarios-medico/`;
  private medicoEspecialidadUrl = `${environment.apiUrl}/medico-especialidad/`;

  constructor(private http: HttpClient) {}

  // Obtener todos los horarios
  getHorarios(): Observable<HorarioMedico[]> {
    return this.http.get<HorarioMedico[]>(this.apiUrl);
  }

  // Obtener un horario por ID
  getHorario(id: number): Observable<HorarioMedico> {
    return this.http.get<HorarioMedico>(`${this.apiUrl}${id}/`);
  }

  // Crear un nuevo horario
  createHorario(horario: HorarioMedico): Observable<HorarioMedico> {
    return this.http.post<HorarioMedico>(this.apiUrl, horario);
  }

  // Actualizar horario existente
  updateHorario(id: number, horario: HorarioMedico): Observable<HorarioMedico> {
    return this.http.put<HorarioMedico>(`${this.apiUrl}${id}/`, horario);
  }

  // Eliminar horario
  deleteHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // Obtener médicos con sus especialidades
  getMedicosEspecialidades(): Observable<any[]> {
    return this.http.get<any[]>(this.medicoEspecialidadUrl);
  }
}