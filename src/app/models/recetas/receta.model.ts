export interface DetalleReceta {
  id: number;
  receta: number;               // FK según backend
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string;
}

export interface Receta {
  id: number;
  consulta: number;             // el backend usa "consulta", no "id_consulta"
  fecha_receta: string;
  observaciones: string;

  paciente_nombre: string;      // así lo envía el serializer
  medico_nombre: string;        // así lo envía el serializer
  detalles: DetalleReceta[];    // viene read_only en el serializer
}
