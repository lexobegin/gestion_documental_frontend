import { Rol } from '../rol/rol.model';

export interface Usuario {
  id?: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string; // 'YYYY-MM-DD'
  genero?: 'M' | 'F' | string;
  activo: boolean;
  rol?: Rol;      // lectura
  id_rol?: number; // escritura
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  genero?: 'M' | 'F' | string;
  activo: boolean;
  id_rol: number;
}

export type UpdateUsuarioDto = Partial<CreateUsuarioDto>; // password opcional en update

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
