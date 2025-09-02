import { Component } from '@angular/core';
import { AutoService } from '../../../services/auto/auto.service';
import { Auto } from '../../../models/auto/auto.model';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auto-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auto-create.component.html',
  styleUrl: './auto-create.component.scss',
})
export class AutoCreateComponent {
  auto: Auto = {
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
  };

  mensajeExito: string = '';
  mostrarAlerta: boolean = false;

  constructor(private autoService: AutoService, private router: Router) {}

  /*crearAuto(): void {
    this.autoService.crearAuto(this.auto).subscribe({
      next: () => this.router.navigate(['/autos']),
      error: (err) => console.error('Error al crear auto', err),
    });
  }*/

  crearAuto(): void {
    this.autoService.crearAuto(this.auto).subscribe({
      next: () => {
        this.mensajeExito = 'Auto creado exitosamente.';
        this.mostrarAlerta = true;
        setTimeout(() => this.router.navigate(['/autos']), 1500); // Navega luego de mostrar alerta
      },
      error: (err) => console.error('Error al crear auto', err),
    });
  }
}
