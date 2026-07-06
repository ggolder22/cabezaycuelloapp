export type RolUsuario =
  | 'admin'
  | 'medico_especialista'
  | 'oncologo'
  | 'cirujano_cabeza_cuello'
  | 'fonoaudiologo'
  | 'radiologo'
  | 'patologo'
  | 'maxilofacial'
  | 'orl'
  | 'endocrinologo'
  | 'estomatologo'
  | 'cirujano_general'
  | 'enfermero'
  | 'recepcionista'

export interface DerivacionCircuito {
  nombre: string
  especialidad: string
  tipo: 'urgente' | 'programado' | null
}

export interface Usuario {
  id: string
  email: string
  primer_nombre: string
  segundo_nombre?: string
  primer_apellido: string
  segundo_apellido?: string
  rol: RolUsuario
  numero_matricula?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Paciente {
  id: string
  numero_historia: string
  tipo_documento: 'CC' | 'CE' | 'DNI' | 'PA' | 'RC' | 'TI' | 'NIT'
  numero_documento: string
  primer_nombre: string
  segundo_nombre?: string | null
  primer_apellido: string
  segundo_apellido?: string | null
  fecha_nacimiento: string
  sexo: 'M' | 'F' | 'O'
  telefono?: string | null
  celular: string
  email?: string | null
  direccion?: string | null
  ciudad?: string | null
  departamento?: string | null
  eps?: string | null
  tipo_afiliacion?: 'contributivo' | 'subsidiado' | 'vinculado' | 'particular' | null
  tipo_derivacion: 'espontanea' | 'imagenes' | 'interconsulta' | 'urgencias'
  motivo_consulta: string
  antecedentes_oncologicos: boolean
  antecedentes_oncologicos_detalle?: string | null
  antecedentes_quirurgicos: boolean
  antecedentes_quirurgicos_detalle?: string | null
  comorbilidades?: string | null
  medicacion_impacto?: string | null
  alergias: boolean
  alergias_detalle?: string | null
  estado_general: 'conservado' | 'regular' | 'comprometido'
  signos_alarma: boolean
  signos_alarma_detalle?: string | null
  observaciones_ingreso?: string | null
  derivaciones?: Array<{ nombre: string; especialidad: string; tipo: 'urgente' | 'programado' }> | null
  activo: boolean
  creado_por: string
  created_at: string
  updated_at: string
}

export interface HistoriaClinica {
  id: string
  paciente_id: string
  medico_id: string
  fecha_consulta: string
  motivo_consulta: string
  enfermedad_actual: string
  antecedentes_personales?: string
  antecedentes_familiares?: string
  revision_sistemas?: string
  examen_fisico?: string
  diagnostico_principal: string
  diagnosticos_secundarios?: string
  cie10_principal?: string
  plan_tratamiento?: string
  observaciones?: string
  created_at: string
  updated_at: string
}

export interface Cita {
  id: string
  paciente_id: string
  medico_id: string
  fecha_hora: string
  duracion_minutos: number
  tipo_consulta: 'primera_vez' | 'control' | 'procedimiento' | 'urgencia'
  estado: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio'
  motivo?: string
  notas?: string
  creado_por: string
  created_at: string
  updated_at: string
}

export interface ArchivoClinico {
  id: string
  paciente_id: string
  historia_id?: string
  nombre: string
  descripcion?: string
  tipo: 'imagen_diagnostica' | 'laboratorio' | 'biopsia' | 'informe' | 'consentimiento' | 'otro'
  formato: string
  url: string
  subido_por: string
  created_at: string
}

export interface AuditLog {
  id: string
  tabla: string
  registro_id: string
  accion: 'INSERT' | 'UPDATE' | 'DELETE'
  datos_anteriores?: Record<string, unknown>
  datos_nuevos?: Record<string, unknown>
  usuario_id: string
  ip?: string
  created_at: string
}
