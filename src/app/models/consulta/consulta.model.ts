export interface Consulta {
  id: number;
  historia_clinica: number;
  medico: number;
  medico_nombre: string;
  medico_apellido: string;
  paciente_nombre: string;
  paciente_apellido: string;
  fecha_consulta: string;
  motivo_consulta: string;
  sintomas: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string | null;
}

export interface ConsultaCreate {
  historia_clinica: number;
  medico: number;
  motivo_consulta: string;
  sintomas?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
}

export interface ConsultaUpdate {
  motivo_consulta?: string;
  sintomas?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
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
  historia_clinica?: number;
  medico?: number;
}
