// paciente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  //private apiUrl = 'http://localhost:8000/api/pacientes/'; // ajusta tu endpoint
  private apiUrl = `${environment.apiUrl}/pacientes/`;

  constructor(private http: HttpClient) {}

  listarPacientes(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((resp) => resp.results) // 👈 extraemos solo el array de pacientes
    );
  }
}
