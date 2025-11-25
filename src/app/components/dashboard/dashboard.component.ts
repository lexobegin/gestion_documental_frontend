import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard/dashboard.service';

import { NgChartsModule } from 'ng2-charts';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgChartsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  loading = true;
  error = '';
  data: any = null;
  tipoUsuario: 'medico' | 'admin' | null = null;

  // Búsqueda
  searchQuery = '';
  searchResults: any[] = [];

  // Modo oscuro
  isDarkMode = false;

  // Filtros
  selectedDateRange = 'Este mes';
currentMonth: any;
currentDate = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});
userName: any;

  constructor(private dashboardService: DashboardService) {
    // Cargar preferencia de modo oscuro
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.data = res;
        this.tipoUsuario = res.tipo_usuario;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error cargando dashboard';
        this.loading = false;
      }
    });
  }

  // Búsqueda inteligente
  onSearch(): void {
    if (!this.searchQuery || this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }
    // Implementar búsqueda aquí
    console.log('Buscando:', this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }

  selectResult(result: any): void {
    console.log('Resultado seleccionado:', result);
    this.clearSearch();
  }

  // Modo oscuro
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  // Refrescar dashboard
  refreshDashboard(): void {
    this.loadDashboard();
  }
}