'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export interface AteneoItem {
  id: string
  paciente_id: string
  motivo: string
  estado: 'pendiente' | 'discutido'
  fecha_solicitud: string
  fecha_discusion: string | null
  resolucion: string | null
  solicitado_por: string
  pacientes: {
    id: string
    primer_nombre: string
    primer_apellido: string
    numero_historia: string
  }
  solicitante: {
    primer_nombre: string
    primer_apellido: string
  } | null
}

export async function obtenerPendientes(): Promise<AteneoItem[]> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('ateneos')
    .select('*, pacientes(id, primer_nombre, primer_apellido, numero_historia)')
    .eq('estado', 'pendiente')
    .order('fecha_solicitud', { ascending: false })
  if (error) console.error('[ateneo] obtenerPendientes error:', error)
  if (!data) return []

  // Buscar los solicitantes por separado para evitar problemas de FK en PostgREST
  const ids = [...new Set(data.map((r: { solicitado_por: string }) => r.solicitado_por).filter(Boolean))]
  let solicitantesMap: Record<string, { primer_nombre: string; primer_apellido: string }> = {}
  if (ids.length > 0) {
    const { data: usuarios } = await service
      .from('usuarios')
      .select('id, primer_nombre, primer_apellido')
      .in('id', ids)
    if (usuarios) {
      for (const u of usuarios as { id: string; primer_nombre: string; primer_apellido: string }[]) {
        solicitantesMap[u.id] = { primer_nombre: u.primer_nombre, primer_apellido: u.primer_apellido }
      }
    }
  }

  return data.map((r: { solicitado_por: string }) => ({
    ...r,
    solicitante: solicitantesMap[r.solicitado_por] ?? null,
  })) as unknown as AteneoItem[]
}

export async function obtenerDiscutidos(): Promise<AteneoItem[]> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('ateneos')
    .select('*, pacientes(id, primer_nombre, primer_apellido, numero_historia)')
    .eq('estado', 'discutido')
    .order('fecha_discusion', { ascending: false })
    .limit(100)
  if (error) console.error('[ateneo] obtenerDiscutidos error:', error)
  if (!data) return []

  const ids = [...new Set(data.map((r: { solicitado_por: string }) => r.solicitado_por).filter(Boolean))]
  let solicitantesMap: Record<string, { primer_nombre: string; primer_apellido: string }> = {}
  if (ids.length > 0) {
    const { data: usuarios } = await service
      .from('usuarios')
      .select('id, primer_nombre, primer_apellido')
      .in('id', ids)
    if (usuarios) {
      for (const u of usuarios as { id: string; primer_nombre: string; primer_apellido: string }[]) {
        solicitantesMap[u.id] = { primer_nombre: u.primer_nombre, primer_apellido: u.primer_apellido }
      }
    }
  }

  return data.map((r: { solicitado_por: string }) => ({
    ...r,
    solicitante: solicitantesMap[r.solicitado_por] ?? null,
  })) as unknown as AteneoItem[]
}

export async function obtenerCantidadPendientes(): Promise<number> {
  const service = createServiceClient()
  const { count } = await service
    .from('ateneos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente')
  return count ?? 0
}

export async function tienePendiente(paciente_id: string): Promise<boolean> {
  const service = createServiceClient()
  const { data } = await service
    .from('ateneos')
    .select('id')
    .eq('paciente_id', paciente_id)
    .eq('estado', 'pendiente')
    .maybeSingle()
  return !!data
}

export async function proponerAteneo(paciente_id: string, motivo: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const service = createServiceClient()
  const { error } = await service.from('ateneos').insert({
    paciente_id,
    motivo,
    solicitado_por: user.id,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function marcarDiscutido(id: string, resolucion: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const service = createServiceClient()
  const { error } = await service
    .from('ateneos')
    .update({
      estado: 'discutido',
      fecha_discusion: new Date().toISOString(),
      resolucion: resolucion || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
