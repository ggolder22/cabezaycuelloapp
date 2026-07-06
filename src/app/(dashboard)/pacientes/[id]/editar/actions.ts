'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { PacienteFormData } from '@/lib/validations/paciente'

export async function actualizarPaciente(id: string, data: PacienteFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const service = createServiceClient()
  const { error } = await service
    .from('pacientes')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
