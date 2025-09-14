import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EspecialidadService } from '../../../services/especialidades_alison/especialidades.service';
import { Especialidad } from '../../../models/especialidades_alison/especialidades.model';

@Component({
  selector: 'app-especialidad-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './especialidad-update.component.html',
  styleUrls: ['./especialidad-update.component.scss']
})
export class EspecialidadUpdateComponent implements OnInit {
  id!: number;
  model: Especialidad = { codigo: '', nombre: '', descripcion: '' };
  loading = true;
  saving = false;
  error = '';

  constructor(private route: ActivatedRoute, private service: EspecialidadService, private router: Router) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.get(this.id).subscribe({
      next: (data) => { this.model = data; this.loading = false; },
      error: () => { this.error = 'No se encontró la especialidad'; this.loading = false; }
    });
  }

  submit(f: NgForm) {
    if (f.invalid) return;
    this.saving = true;
    const { id, ...payload } = this.model;
    this.service.update(this.id, payload).subscribe({
      next: () => this.router.navigate(['/especialidades']),
      error: (err) => {
        this.error = err?.error?.detail || 'No se pudo actualizar';
        this.saving = false;
      }
    });
  }
}
