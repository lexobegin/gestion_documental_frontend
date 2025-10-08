import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BitacoraFilters } from '../../../models/bitacora/bitacora.model';

@Component({
  selector: 'app-bitacora-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bitacora-filter.component.html'
})
export class BitacoraFilterComponent implements OnInit {
  @Output() filtrosCambiados = new EventEmitter<BitacoraFilters>();

  filtros: BitacoraFilters = {};
  
  // Opciones para selects
  modulos = [
    { value: 'usuarios', label: 'Usuarios' },
    { value: 'citas', label: 'Citas' },
    { value: 'historias_clinicas', label: 'Historias Clínicas' },
    { value: 'consultas', label: 'Consultas' },
    { value: 'backups', label: 'Backups' },
    { value: 'roles', label: 'Roles' },
    { value: 'permisos', label: 'Permisos' },
    { value: 'componentes', label: 'Componentes' },
    { value: 'horarios', label: 'Horarios' }
  ];

  ngOnInit(): void {
    this.emitirFiltros();
  }

  onFiltroChange(): void {
    this.emitirFiltros();
  }

  emitirFiltros(): void {
    this.filtrosCambiados.emit({ ...this.filtros });
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.emitirFiltros();
  }

  get tieneFiltros(): boolean {
    return !!(
      this.filtros.modulo_afectado ||
      this.filtros.fecha_desde ||
      this.filtros.fecha_hasta
    );
  }
}