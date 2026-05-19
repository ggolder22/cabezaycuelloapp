import { z } from 'zod'

export const pacienteSchema = z.object({
  // Sección 1 — Datos filiatorios
  tipo_documento: z.enum(['CC', 'CE', 'DNI', 'PA', 'RC', 'TI', 'NIT']),
  numero_documento: z.string().min(4, 'Documento inválido').max(20),
  primer_nombre: z.string().min(2, 'Requerido').max(50),
  segundo_nombre: z.string().max(50).optional(),
  primer_apellido: z.string().min(2, 'Requerido').max(50),
  segundo_apellido: z.string().max(50).optional(),
  fecha_nacimiento: z.string().min(1, 'Requerido'),
  sexo: z.enum(['M', 'F', 'O']),
  celular: z.string().min(7, 'Celular inválido').max(15),
  telefono: z.string().max(15).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().max(200).optional(),
  ciudad: z.string().max(100).optional(),
  departamento: z.string().max(100).optional(),
  eps: z.string().max(100).optional(),
  tipo_afiliacion: z.enum(['contributivo', 'subsidiado', 'vinculado', 'particular']).optional(),
  tipo_derivacion: z.enum(['espontanea', 'imagenes', 'interconsulta', 'urgencias']),
  motivo_consulta: z.string().min(5, 'Ingrese el motivo de consulta').max(500),

  // Sección 2 — Antecedentes
  antecedentes_oncologicos: z.boolean(),
  antecedentes_oncologicos_detalle: z.string().max(300).optional(),
  antecedentes_quirurgicos: z.boolean(),
  antecedentes_quirurgicos_detalle: z.string().max(300).optional(),
  comorbilidades: z.string().max(400).optional(),
  medicacion_impacto: z.string().max(400).optional(),
  alergias: z.boolean(),
  alergias_detalle: z.string().max(300).optional(),

  // Sección 3 — Examen clínico dirigido
  estado_general: z.enum(['conservado', 'regular', 'comprometido']),
  signos_alarma: z.boolean(),
  signos_alarma_detalle: z.string().max(400).optional(),
  observaciones_ingreso: z.string().max(600).optional(),

  // Sección 4 — Derivaciones (guardado como JSONB)
  derivaciones: z.array(z.object({
    nombre: z.string(),
    especialidad: z.string(),
    tipo: z.enum(['urgente', 'programado']),
  })),
})

export type PacienteFormData = z.infer<typeof pacienteSchema>
