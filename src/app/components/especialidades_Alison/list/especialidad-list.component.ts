
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EspecialidadService, Paginated } from '../../../services/especialidades_alison/especialidades.service';
import { Especialidad } from '../../../models/especialidades_alison/especialidades.model';

declare var bootstrap: any; // para modales Bootstrap

@Component({
  selector: 'app-especialidad-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './especialidad-list.component.html',
  styleUrls: ['./especialidad-list.component.scss']
})
export class EspecialidadListComponent implements OnInit {
  rows: Especialidad[] = [];
  loading = false;
  error = '';
  success = '';
  search = '';
  page = 1;
  page_size = 10;
  total = 0;

  // para modal de confirmación
  selected?: Especialidad;
  private modal?: any;

  constructor(private service: EspecialidadService) {}

  ngOnInit() {
    this.fetch();
    const el = document.getElementById('confirmDeleteModal');
    if (el) this.modal = new bootstrap.Modal(el);
  }

  fetch() {
    this.loading = true;
    this.service.list({ search: this.search, page: this.page, page_size: this.page_size })
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.rows = data;
            this.total = data.length;
          } else {
            const p = data as Paginated<Especialidad>;
            this.rows = p.results;
            this.total = p.count;
          }
          this.error = '';
        },
        error: (err) => {
          this.error = err?.error?.detail || 'Error cargando especialidades';
        },
        complete: () => this.loading = false
      });
  }

  openDelete(row: Especialidad) {
    this.selected = row;
    this.modal?.show();
  }

  confirmDelete() {
    if (!this.selected?.id) return;
    this.service.delete(this.selected.id).subscribe({
      next: () => {
        this.success = `Especialidad "${this.selected!.nombre}" eliminada`;
        this.fetch();
      },
      error: (err) => {
        this.error = err?.error?.detail || 'No se pudo eliminar';
      },
      complete: () => this.modal?.hide()
    });
  }

  onSearchKeyup(ev: any) {
    this.search = ev.target.value;
    this.page = 1;
    this.fetch();
  }

  changePage(delta: number) {
    const maxPage = Math.max(1, Math.ceil(this.total / this.page_size));
    this.page = Math.min(maxPage, Math.max(1, this.page + delta));
    this.fetch();
  }
}
