export interface Backup {
  id: number;
  nombre_archivo: string;
  tamano_bytes: number;
  fecha_backup: string;
  usuario_responsable: number;
  usuario_responsable_email: string;
  usuario_responsable_nombre: string;
  tipo_backup: 'Completo' | 'Incremental' | 'Diferencial';
  estado: 'Exitoso' | 'Fallido' | 'En Progreso';
  ubicacion_almacenamiento: string;
  notas: string;
}

export interface BackupCreate {
  tipo_backup: string;
  notas?: string;
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
  tipo_backup?: string;
  estado?: string;
  usuario_responsable?: number;
}
