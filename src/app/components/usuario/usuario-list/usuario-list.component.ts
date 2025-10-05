import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Usuario, UsuarioFiltros } from '../../../models/usuario/usuario.model';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { ExportService } from '../../../services/exportar/export.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.scss'],
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];
  todosUsuarios: Usuario[] = []; // Para exportar
  cargando = false;
  generandoReporte = false;
  error?: string;

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalUsuarios = 0;
  tamanoPagina = 10;

  // Búsqueda
  terminoBusqueda = '';

  // Modales
  mostrarModalEliminar = false;
  mostrarModalDetalle = false;
  usuarioSeleccionado?: Usuario;
  usuarioAEliminar?: Usuario;

  constructor(
    private srv: UsuarioService,
    private exportSrv: ExportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.error = undefined;
    this.paginaActual = pagina;

    const params: any = {
      page: pagina,
      page_size: this.tamanoPagina,
    };

    // Aplicar filtros solo si tienen valor
    if (this.terminoBusqueda) {
      params.search = this.terminoBusqueda;
    }

    console.log('Cargando con parámetros:', params);

    this.srv.listar(params).subscribe({
      next: (respuesta) => {
        this.usuarios = respuesta.results || [];
        this.totalUsuarios = respuesta.count || 0;
        this.totalPaginas = Math.ceil(this.totalUsuarios / this.tamanoPagina);
        this.cargando = false;

        // Cargar todos los usuarios para exportar después de cargar la página
        this.cargarTodosUsuarios();
      },
      error: (e) => {
        console.error('Error al listar usuarios:', e);
        this.error = this.extraerError(e) || 'No se pudo cargar usuarios';
        this.cargando = false;
      },
    });
  }

  cargarTodosUsuarios(): void {
    const filtros: UsuarioFiltros = {};

    // Aplicar los mismos filtros que en la tabla
    if (this.terminoBusqueda) {
      filtros.search = this.terminoBusqueda;
    }

    console.log('Cargando todos los usuarios con filtros:', filtros);

    this.srv.listarTodos(filtros).subscribe({
      next: (usuarios) => {
        this.todosUsuarios = usuarios || [];
        console.log(
          'Usuarios cargados para exportar:',
          this.todosUsuarios.length
        );
      },
      error: (e) => {
        console.error('Error al cargar usuarios para exportar:', e);
        this.todosUsuarios = [];
      },
    });
  }

  buscar(): void {
    console.log('Buscando con:', {
      termino: this.terminoBusqueda,
    });
    this.paginaActual = 1;
    this.cargar(1);
  }

  /*aplicarFiltros(): void {
    console.log('Aplicando filtros:', {
      
    });
    this.paginaActual = 1;
    this.cargar(1);
  }*/

  limpiarFiltros(): void {
    console.log('Limpiando filtros');
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.cargar(1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.cargar(pagina);
    }
  }

  crear(): void {
    this.router.navigate(['/usuarios/crear']);
  }

  editar(id?: number): void {
    if (id == null) return;
    this.router.navigate(['/usuarios/editar', id]);
  }

  verDetalle(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarModalDetalle = true;
  }

  confirmarEliminar(usuario: Usuario): void {
    this.usuarioAEliminar = usuario;
    this.mostrarModalEliminar = true;
  }

  eliminar(): void {
    if (!this.usuarioAEliminar?.id) return;

    const id = this.usuarioAEliminar.id;
    const backup = this.usuarios.slice();

    this.usuarios = this.usuarios.filter((u) => u.id !== id);
    this.mostrarModalEliminar = false;

    this.srv.eliminar(id).subscribe({
      next: () => {
        this.cargar(this.paginaActual);
      },
      error: (e) => {
        console.error('Error al eliminar usuario:', e);
        this.error = this.extraerError(e) || 'No se pudo eliminar el usuario';
        this.usuarios = backup;
      },
    });
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.usuarioAEliminar = undefined;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.usuarioSeleccionado = undefined;
  }

  /** ==================== REPORTES ==================== */

  generarReportePDF(): void {
    console.log('Generando PDF con', this.todosUsuarios.length, 'usuarios');
    this.generarReporte('pdf');
  }

  generarReporteExcel(): void {
    console.log('Generando Excel con', this.todosUsuarios.length, 'usuarios');
    this.generarReporte('excel');
  }

  generarReporteHTML(): void {
    console.log('Generando HTML con', this.todosUsuarios.length, 'usuarios');
    this.generarReporte('html');
  }

  private generarReporte(formato: 'pdf' | 'excel' | 'html'): void {
    if (this.todosUsuarios.length === 0) {
      this.error = 'No hay datos para generar el reporte';
      return;
    }

    this.generandoReporte = true;
    this.error = undefined;

    try {
      const datosExportar = this.exportSrv.prepararDatosUsuarios(
        this.todosUsuarios
      );
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `reporte_usuarios_${fecha}`;
      const title = `Reporte de Usuarios - ${new Date().toLocaleDateString(
        'es-ES'
      )}`;

      switch (formato) {
        case 'pdf':
          this.exportSrv.exportToPDF(datosExportar, filename, title);
          break;
        case 'excel':
          this.exportSrv.exportToExcel(datosExportar, filename);
          break;
        case 'html':
          this.exportSrv.exportToHTML(datosExportar, filename, title);
          break;
      }

      console.log(`Reporte ${formato} generado exitosamente`);
    } catch (error) {
      console.error(`Error al generar reporte ${formato}:`, error);
      this.error = `Error al generar el reporte ${formato.toUpperCase()}`;
    } finally {
      this.generandoReporte = false;
    }
  }

  // ... (mantener los métodos helpers existentes: getRole, labelRole, etc.)

  getRole(u: any): string {
    let r =
      this.normalizeRoleValue(u?.rol) ||
      this.normalizeRoleValue(u?.role) ||
      this.normalizeRoleValue(u?.tipo);
    if (!r) r = this.normalizeRoleValue(u?.profile?.role);
    if (!r) r = this.normalizeRoleValue(u?.groups);
    if (!r && (u?.is_superuser || u?.is_staff)) r = 'admin';
    if (!r && typeof u?.role_id !== 'undefined')
      r = this.normalizeRoleValue(u.role_id);
    return r || 'paciente';
  }

  labelRole(role: string | null | undefined): string {
    switch ((role || '').toLowerCase()) {
      case 'admin':
        return 'Admin';
      case 'médico':
      case 'medico':
        return 'Médico';
      case 'paciente':
        return 'Paciente';
      default:
        return role ? role : 'Paciente';
    }
  }

  private normalizeRoleValue(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') return v.toLowerCase().trim();
    if (typeof v === 'number') {
      const mapNum: Record<number, string> = {
        1: 'admin',
        2: 'medico',
        3: 'paciente',
      };
      return mapNum[v] || '';
    }
    if (Array.isArray(v) && v.length > 0) return this.normalizeRoleValue(v[0]);
    if (typeof v === 'object') {
      const candidates = [
        v.name,
        v.nombre,
        v.label,
        v.value,
        v.slug,
        v.key,
        v.role,
        v.rol,
        v.tipo,
        v.code,
      ];
      for (const c of candidates) {
        const n = this.normalizeRoleValue(c);
        if (n) return n;
      }
      if (typeof v.id === 'number') return this.normalizeRoleValue(v.id);
    }
    return '';
  }

  trackById(_i: number, u: Usuario): number | undefined {
    return u.id;
  }

  private extraerError(err: any): string {
    const e = err?.error;
    if (!e) return '';
    if (typeof e === 'string') return e;
    if (e.detail) return e.detail;
    if (typeof e === 'object') {
      const msgs: string[] = [];
      for (const k of Object.keys(e)) {
        const v = e[k];
        if (Array.isArray(v)) msgs.push(`${k}: ${v.join(', ')}`);
        else if (typeof v === 'string') msgs.push(`${k}: ${v}`);
      }
      return msgs.join(' | ');
    }
    return '';
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearGenero(genero: string | null | undefined): string {
    switch (genero) {
      case 'M':
        return 'Masculino';
      case 'F':
        return 'Femenino';
      default:
        return '—';
    }
  }
}
