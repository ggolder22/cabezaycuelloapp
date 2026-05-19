import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const recuperarPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const registroSchema = z.object({
  primer_nombre: z.string().min(2, 'Requerido').max(50),
  segundo_nombre: z.string().max(50).optional(),
  primer_apellido: z.string().min(2, 'Requerido').max(50),
  segundo_apellido: z.string().max(50).optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmar_password: z.string(),
  rol: z.enum([
    'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello',
    'fonoaudiologo', 'radiologo', 'patologo', 'maxilofacial',
    'orl', 'endocrinologo', 'estomatologo', 'cirujano_general',
    'enfermero', 'recepcionista',
  ] as const),
}).refine(d => d.password === d.confirmar_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar_password'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RecuperarPasswordFormData = z.infer<typeof recuperarPasswordSchema>
export type RegistroFormData = z.infer<typeof registroSchema>
