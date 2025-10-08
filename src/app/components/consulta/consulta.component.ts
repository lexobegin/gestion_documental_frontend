import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../services/consulta/consulta.service';
import { PacienteService } from '../../services/consulta/paciente.service';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.scss']
})
export class ConsultaComponent implements OnInit {
  consulta: any = {
    paciente: null,
    motivo_consulta: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
  };

  pacientes: any[] = [];
  guardando = false;
  error?: string;
  mensaje?: string;

  constructor(
    private consultaService: ConsultaService,
    private pacienteService: PacienteService
  ) { }

  ngOnInit(): void {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
        this.error = 'No se pudieron cargar los pacientes';
      }
    });
  }

  guardar(form: any) {
    if (form.valid) {
      this.guardando = true;
      this.error = undefined;
      this.mensaje = undefined;

      this.consultaService.crearConsulta(this.consulta).subscribe({
        next: (resp) => {
          this.mensaje = 'Consulta creada con éxito';
          this.consulta = {}; // reset
          form.resetForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear consulta:', err);
          this.error = 'Error al crear la consulta';
          this.guardando = false;
        }
      });
    }
  }
}