import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment'; 

@Component({
  selector: 'app-horario-medico-create',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './horario-medico-create.component.html',
  styleUrls: ['./horario-medico-create.component.css']
})
export class HorarioMedicoCreateComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  //  URLs dinámicas: cambian automáticamente entre dev y producción
  baseUrl = `${environment.apiUrl}/horarios-medico/`;
  medicoEspecialidadesUrl = `${environment.apiUrl}/select/medico-especialidades/`;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  medicoEspecialidades: any[] = [];

  horario = {
    medico_especialidad: '',
    dia_semana: 'Lunes',
    hora_inicio: '',
    hora_fin: '',
    activo: true
  };

  ngOnInit(): void {
    this.cargarMedicoEspecialidades();
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

  guardar() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    this.http.post(this.baseUrl, this.horario, { headers }).subscribe({
      next: () => {
        console.log('✅ Horario creado con éxito');
        this.router.navigate(['/horarios']);
      },
      error: (err) => console.error('❌ Error creando horario:', err)
    });
  }

  cancelar() {
    this.router.navigate(['/horarios']);
  }
}