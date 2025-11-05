export interface DetalleReceta {
  id: number;
  id_receta: number;
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string;
}

export interface Receta {
  id: number;
  id_consulta: number;
  fecha_receta: string;
  observaciones: string;
  paciente: string;   // viene de consulta → paciente.nombre
  medico: string;     // viene de consulta → medico.nombre
  diagnostico: string; // consulta.diagnostico
  detalles: DetalleReceta[];
}