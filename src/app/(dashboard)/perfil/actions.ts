'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { Usuario } from '@/types'

export async function obtenerPerfilActual(): Promise<Usuario | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const service = createServiceClient()
  const { data } = await service.from('usuarios').select('*').eq('id', user.id).single()
  return (data as Usuario) ?? null
}

export async function actualizarPerfil(data: {
  primer_nombre: string
  segundo_nombre?: string
  primer_apellido: string
  segundo_apellido?: string
  numero_matricula?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const service = createServiceClient()
  const { error } = await service
    .from('usuarios')
    .update({
      primer_nombre: data.primer_nombre,
      segundo_nombre: data.segundo_nombre || null,
      primer_apellido: data.primer_apellido,
      segundo_apellido: data.segundo_apellido || null,
      numero_matricula: data.numero_matricula || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
