export interface EspecialidadCita {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface Cita {
  id: number;
  paciente: number;
  paciente_nombre: string;
  paciente_apellido: string;
  medico_especialidad: number; // ID de la relación médico-especialidad
  medico_id: number;
  medico_nombre: string;
  medico_apellido: string;
  especialidad_id: number;
  especialidad_nombre: string;
  fecha_cita: string;
  hora_cita: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'realizada';
  motivo: string;
  notas: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CitaCreate {
  paciente: number;
  medico_especialidad: number; // Ahora necesitamos este ID
  fecha_cita: string;
  hora_cita: string;
  estado?: string;
  motivo: string;
  notas?: string | null;
}

export interface CitaUpdate {
  fecha_cita?: string;
  hora_cita?: string;
  estado?: string;
  motivo?: string;
  notas?: string | null;
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
  estado?: string;
  medico?: number;
  paciente?: number;
  fecha_cita?: string;
}
