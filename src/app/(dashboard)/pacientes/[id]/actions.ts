'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function registrarEvolucion(data: {
  paciente_id: string
  tipo: string
  descripcion: string
  diagnostico?: string | null
  numero_matricula: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const service = createServiceClient()
  const { error } = await service.from('evoluciones').insert({
    paciente_id: data.paciente_id,
    medico_id: user.id,
    tipo: data.tipo,
    descripcion: data.descripcion,
    diagnostico: data.diagnostico ?? null,
    numero_matricula: data.numero_matricula,
  })

  if (error) return { error: error.message }
  return { success: true }
}
