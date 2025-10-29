// =======================
// MODELO COMPLETO DE CONSULTAS
// =======================

// Interface principal para Consultas (lectura y actualización)
export interface Consulta {
  id?: number;
  historia_clinica?: number;
  medico?: number;
  cita?: number;
  fecha_consulta?: string;
  motivo_consulta: string;
  sintomas?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;

  // Campos médicos
  peso?: number;
  altura?: number;
  presion_arterial?: string;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  saturacion_oxigeno?: number;

  // Campos adicionales
  prescripciones?: string;
  examenes_solicitados?: string;
  proxima_cita?: string;
  notas_privadas?: string;

  // Campos de solo lectura (devueltos por el backend)
  medico_nombre?: string;
  medico_apellido?: string;
  paciente_nombre?: string;
  paciente_apellido?: string;
  paciente_email?: string;
  edad_paciente?: number;
  imc?: number;
  cita_id?: number;
  cita_fecha?: string;
  cita_hora?: string;
}

// Interface específica para CREAR consultas (usando el endpoint simple)
export interface ConsultaCreate {
  // Solo estos campos se envían en el POST de /crear-consulta-simple/
  paciente_email: string;        // requerido por tu backend
  motivo_consulta: string;
  sintomas?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;

  // Campos médicos opcionales
  peso?: number;
  altura?: number;
  presion_arterial?: string;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  saturacion_oxigeno?: number;

  // Adicionales opcionales
  prescripciones?: string;
  examenes_solicitados?: string;
  proxima_cita?: string;
  notas_privadas?: string;
}

// Respuesta paginada estándar del backend (DRF)
export interface ConsultaListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Consulta[];
}

// Interfaces auxiliares (por si necesitas listar pacientes)
export interface Paciente {
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  tipo_sangre?: string;
  estado: string;
}

export interface PacienteListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Paciente[];
}
