import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const recuperarPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RecuperarPasswordFormData = z.infer<typeof recuperarPasswordSchema>
