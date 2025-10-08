// paciente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PacienteService {
    private apiUrl = 'http://localhost:8000/api/pacientes/'; // ajusta tu endpoint

    constructor(private http: HttpClient) { }

    listarPacientes(): Observable<any[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(resp => resp.results) // 👈 extraemos solo el array de pacientes
        );
    }
}