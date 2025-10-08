export interface Bitacora {
  id: number;
  usuario: number;
  usuario_email: string;
  usuario_nombre: string;
  ip_address: string;
  accion_realizada: string;
  modulo_afectado: string;
  fecha_hora: string;
  detalles: string;
}

export interface BitacoraFilters {
  modulo_afectado?: string;
  usuario?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
}