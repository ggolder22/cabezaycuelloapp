'use server'

import { createServiceClient } from '@/lib/supabase/service'

export interface EvolucionGlobal {
  id: string
  fecha: string
  tipo: string
  descripcion: string
  diagnostico: string | null
  numero_matricula: string
  paciente_id: string
  pacientes: {
    id: string
    primer_nombre: string
    primer_apellido: string
    numero_historia: string
  }
}

export async function obtenerEvolucionesGlobales(filtros?: {
  tipo?: string
  desde?: string
  hasta?: string
}): Promise<EvolucionGlobal[]> {
  const service = createServiceClient()

  let query = service
    .from('evoluciones')
    .select('id, fecha, tipo, descripcion, diagnostico, numero_matricula, paciente_id, pacientes(id, primer_nombre, primer_apellido, numero_historia)')
    .order('fecha', { ascending: false })
    .limit(200)

  if (filtros?.tipo) {
    query = query.eq('tipo', filtros.tipo)
  }
  if (filtros?.desde) {
    query = query.gte('fecha', filtros.desde)
  }
  if (filtros?.hasta) {
    query = query.lte('fecha', filtros.hasta + 'T23:59:59')
  }

  const { data } = await query
  return (data as unknown as EvolucionGlobal[]) ?? []
}
