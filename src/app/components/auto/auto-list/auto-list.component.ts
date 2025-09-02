import { Component, OnInit } from '@angular/core';
import { AutoService } from '../../../services/auto/auto.service';
import { Auto } from '../../../models/auto/auto.model';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

//import * as bootstrap from 'bootstrap';
declare var bootstrap: any;

@Component({
  selector: 'app-auto-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterLink],
  templateUrl: './auto-list.component.html',
  styleUrl: './auto-list.component.scss',
})
export class AutoListComponent implements OnInit {
  autos: Auto[] = [];
  filtro: string = '';
  //paginacion
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  Math = Math;
  //delete
  idParaEliminar: number | null = null;
  mensajeExito: string = '';
  mostrarAlerta: boolean = false;

  constructor(private autoService: AutoService, private router: Router) {}

  ngOnInit(): void {
    this.cargarAutos();
  }

  // Sin paginacion
  /*cargarAutos(): void {
    this.autoService.obtenerAutos().subscribe({
      next: (data) => {
        this.autos = data;
      },
      error: (err) => {
        console.error('Error al obtener autos', err);
      },
    });
  }*/

  //Con paginacion
  cargarAutos(page: number = 1): void {
    this.autoService.obtenerAutos(page, this.filtro).subscribe({
      next: (data) => {
        this.autos = data.results;
        this.totalItems = data.count;
        this.currentPage = page;
      },
      error: (err) => {
        console.error('Error al obtener autos', err);
      },
    });
  }

  buscar(): void {
    this.cargarAutos(1); // Reiniciar a la primera página al buscar
  }

  irAPagina(pagina: number): void {
    if (pagina !== this.currentPage) {
      this.cargarAutos(pagina);
    }
  }

  eliminarAuto(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este auto?')) {
      this.autoService.eliminarAuto(id).subscribe(() => {
        this.cargarAutos(); // recargar la lista
      });
    }
  }

  irAEditar(id: number): void {
    this.router.navigate(['/autos/editar', id]);
  }

  autosFiltrados(): Auto[] {
    if (!this.filtro) {
      return this.autos;
    }

    const filtroLower = this.filtro.toLowerCase();

    return this.autos.filter(
      (auto) =>
        auto.marca.toLowerCase().includes(filtroLower) ||
        auto.modelo.toLowerCase().includes(filtroLower)
    );
  }
  prepararEliminar(id: number): void {
    this.idParaEliminar = id;
  }

  eliminarConfirmado(): void {
    if (this.idParaEliminar !== null) {
      this.autoService.eliminarAuto(this.idParaEliminar).subscribe({
        next: () => {
          this.mensajeExito = 'Auto eliminado correctamente.';
          this.mostrarAlerta = true;
          this.cargarAutos();
          this.idParaEliminar = null;

          // Cerrar modal programáticamente
          const modalElement = document.getElementById('modalEliminar');
          if (modalElement) {
            const modal =
              bootstrap.Modal.getInstance(modalElement) ||
              new bootstrap.Modal(modalElement);
            modal.hide();
          }
        },
        error: (err) => console.error('Error al eliminar', err),
      });
    }
  }
}
