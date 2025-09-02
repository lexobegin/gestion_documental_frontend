import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  totalProyectosActivos = 12;
  totalProyectosCompletados = 8;
  totalProyectosPendientes = 5;
  presupuestoTotal = 1500000;

  progresoProyecto1 = 80; // 80% de progreso
  progresoProyecto2 = 45; // 45% de progreso
  progresoProyecto3 = 60; // 60% de progreso

  tareasPendientes = [
    { nombre: 'Revisión de planos', fechaLimite: new Date() },
    {
      nombre: 'Compra de materiales',
      fechaLimite: new Date(new Date().setDate(new Date().getDate() + 5)),
    },
    {
      nombre: 'Contratación de equipo',
      fechaLimite: new Date(new Date().setDate(new Date().getDate() + 10)),
    },
  ];

  ngOnInit(): void {
    // Aquí podrías cargar los datos desde una API o backend si es necesario
  }
}
