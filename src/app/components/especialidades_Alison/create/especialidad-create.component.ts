import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { EspecialidadService } from '../../../services/especialidades_alison/especialidades.service';
import { Especialidad } from '../../../models/especialidades_alison/especialidades.model';

@Component({
  selector: 'app-especialidad-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './especialidad-create.component.html',
  styleUrls: ['./especialidad-create.component.scss']
})
export class EspecialidadCreateComponent {
  model: Especialidad = { codigo: '', nombre: '', descripcion: '' };
  error = '';
  saving = false;

  constructor(private service: EspecialidadService, private router: Router) {}

  submit(f: NgForm) {
    if (f.invalid) return;
    this.saving = true;
    this.service.create(this.model).subscribe({
      next: () => this.router.navigate(['/especialidades']),
      error: (err) => {
        this.error = err?.error?.detail || 'No se pudo crear la especialidad';
        this.saving = false;
      }
    });
  }
}
