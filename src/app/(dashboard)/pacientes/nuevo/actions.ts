'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { PacienteFormData } from '@/lib/validations/paciente'

export async function verificarDuplicado(numero_documento: string, primer_nombre: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('pacientes')
    .select('id, numero_historia, primer_nombre, primer_apellido, segundo_apellido, tipo_documento, numero_documento')
    .eq('numero_documento', numero_documento.trim())
    .ilike('primer_nombre', primer_nombre.trim())
    .maybeSingle()

  return data ?? null
}

export async function crearPaciente(data: PacienteFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const service = createServiceClient()
  const { data: paciente, error } = await service
    .from('pacientes')
    .insert({ ...data, creado_por: user.id })
    .select('id, numero_historia')
    .single()

  if (error) return { error: error.message }
  return { paciente }
}
