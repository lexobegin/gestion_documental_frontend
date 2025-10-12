export interface Paciente {
  id?: number;
  usuario?: any;
  
  // CAMPOS PARA CREAR
  nombre: string;
  apellido: string;
  password: string;
  
  // Campos existentes
  nombre_completo: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F' | 'O';
  tipo_sangre?: string;
  alergias?: string;
  enfermedades_cronicas?: string;
  medicamentos_actuales?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_parentesco?: string;
  estado: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface PacienteFiltros {
  search?: string;
  estado?: string;
  genero?: string;
}