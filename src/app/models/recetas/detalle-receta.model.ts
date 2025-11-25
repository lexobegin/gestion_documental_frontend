export interface DetalleReceta {
  id: number;
  receta: number;
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string | null;
}

export interface DetalleRecetaCreate {
  receta: number;
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones?: string;
}