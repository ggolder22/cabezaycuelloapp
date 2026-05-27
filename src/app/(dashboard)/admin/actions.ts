'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { Usuario } from '@/types'

export async function obtenerUsuarios(): Promise<Usuario[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const service = createServiceClient()
  const { data: perfil } = await service.from('usuarios').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') return []

  const { data } = await service
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })

  return (data as Usuario[]) ?? []
}
