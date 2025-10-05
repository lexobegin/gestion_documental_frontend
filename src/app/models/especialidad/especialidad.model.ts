export interface Especialidad {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  medicos_count?: number;
}

export interface EspecialidadCreate {
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface EspecialidadUpdate {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationParams {
  page?: number;
  search?: string;
  ordering?: string;
}
