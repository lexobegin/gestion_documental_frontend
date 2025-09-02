import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AutoService } from '../../../services/auto/auto.service';
import { Auto } from '../../../models/auto/auto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auto-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auto-update.component.html',
  styleUrl: './auto-update.component.scss',
})
export class AutoUpdateComponent implements OnInit {
  auto: Auto = {
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
  };

  id!: number;

  constructor(
    private route: ActivatedRoute,
    private autoService: AutoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.autoService.obtenerAutoPorId(this.id).subscribe({
      next: (data) => (this.auto = data),
      error: (err) => console.error('Error al cargar auto', err),
    });
  }

  actualizarAuto(): void {
    this.autoService.actualizarAuto(this.id, this.auto).subscribe({
      next: () => this.router.navigate(['/autos']),
      error: (err) => console.error('Error al actualizar auto', err),
    });
  }
}
