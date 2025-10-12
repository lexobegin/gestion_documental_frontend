export interface HorarioMedico {
  id?: number;
  medico_especialidad: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  fecha_creacion?: string;
  medico_especialidad_nombre?: string;
}