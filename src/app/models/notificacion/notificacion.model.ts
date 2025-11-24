export interface Notificacion {
  id?: number;
  usuario: number; // ID del usuario
  usuario_email?: string;
  usuario_nombre?: string;
  tipo:
    | 'cita'
    | 'resultado'
    | 'seguimiento'
    | 'sistema'
    | 'receta'
    | 'documento';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_envio: string; // ISO string
  datos_adicionales?: any;
}

export interface CreateNotificacionDto {
  usuario: number;
  tipo:
    | 'cita'
    | 'resultado'
    | 'seguimiento'
    | 'sistema'
    | 'receta'
    | 'documento';
  titulo: string;
  mensaje: string;
  leida?: boolean;
  datos_adicionales?: any;
}

export interface UpdateNotificacionDto {
  tipo?:
    | 'cita'
    | 'resultado'
    | 'seguimiento'
    | 'sistema'
    | 'receta'
    | 'documento';
  titulo?: string;
  mensaje?: string;
  leida?: boolean;
  datos_adicionales?: any;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Interface para filtros
export interface NotificacionFiltros {
  tipo?: string;
  leida?: string;
  search?: string;
}
