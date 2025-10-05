import { Rol } from '../rol/rol.model';

export interface Usuario {
  id?: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string; // 'YYYY-MM-DD'
  genero?: 'M' | 'F';
  activo: boolean;
  rol?: Rol; // lectura
  id_rol?: number; // escritura
}

// Unificar interfaces para evitar duplicación
export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  genero?: 'M' | 'F';
  activo: boolean;
  id_rol: number;
}

export type UpdateUsuarioDto = Partial<Omit<CreateUsuarioDto, 'password'>> & {
  password?: string; // Opcional en actualización
};

export interface ChangePasswordDto {
  password: string;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Interface para filtros de reportes
export interface UsuarioFiltros {
  search?: string;
  rol?: string;
  activo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}
