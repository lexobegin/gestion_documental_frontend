import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermisoService } from '../../../services/permiso/permiso.service';


@Component({
    selector: 'app-permisos-create',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './permisos-create.component.html',
    styleUrls: ['./permisos-create.component.scss']
})
export class PermisosCreateComponent {
    nombre: string = '';
    codigo: string = '';
    descripcion: string = '';
    loading = false;
    success: string | null = null;
    error: string | null = null;

    constructor(private permisoService: PermisoService) { }

    crearPermiso() {
        this.loading = true;
        this.success = null;
        this.error = null;
        this.permisoService.create({ nombre: this.nombre, codigo: this.codigo, descripcion: this.descripcion }).subscribe({
            next: () => {
                this.success = 'Permiso creado correctamente';
                this.nombre = '';
                this.codigo = '';
                this.descripcion = '';
                this.loading = false;
            },
            error: () => {
                this.error = 'Error al crear el permiso';
                this.loading = false;
            }
        });
    }
}
