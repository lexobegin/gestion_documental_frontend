import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-horario-medico-update',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './horario-medico-update.component.html',
  styleUrls: ['./horario-medico-update.component.css']
})
export class HorarioMedicoUpdateComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  baseUrl = 'http://localhost:8000/api/horarios-medico/';
  medicoEspecialidadesUrl = 'http://localhost:8000/api/select/medico-especialidades/';
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  medicoEspecialidades: any[] = [];
  horario: any = null;
  id!: number;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarMedicoEspecialidades();
    this.cargarHorario();
  }

  cargarMedicoEspecialidades() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    this.http.get<any[]>(this.medicoEspecialidadesUrl, { headers }).subscribe({
      next: (data) => {
        this.medicoEspecialidades = data;
      },
      error: (err) => console.error('❌ Error cargando médico-especialidades:', err)
    });
  }

  cargarHorario() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    this.http.get<any>(`${this.baseUrl}${this.id}/`, { headers }).subscribe({
      next: (data) => {
        this.horario = data;
      },
      error: (err) => console.error('❌ Error cargando horario:', err)
    });
  }

  actualizar() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    this.http.put(`${this.baseUrl}${this.id}/`, this.horario, { headers }).subscribe({
      next: () => this.router.navigate(['/horarios']),
      error: (err) => console.error('❌ Error actualizando horario:', err)
    });
  }

  cancelar() {
    this.router.navigate(['/horarios']);
  }
}