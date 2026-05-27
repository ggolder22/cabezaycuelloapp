'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { PacienteFormData } from '@/lib/validations/paciente'
import type { Paciente } from '@/types'

export async function obtenerPacientes(busqueda?: string): Promise<Paciente[]> {
  const service = createServiceClient()
  let query = service
    .from('pacientes')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (busqueda?.trim()) {
    const b = busqueda.trim()
    query = query.or(
      `primer_nombre.ilike.%${b}%,primer_apellido.ilike.%${b}%,numero_documento.ilike.%${b}%,numero_historia.ilike.%${b}%`
    )
  }

  const { data } = await query.limit(50)
  return (data as Paciente[]) ?? []
}

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

export async function eliminarPaciente(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que sea admin
  const service = createServiceClient()
  const { data: perfil } = await service.from('usuarios').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') return { error: 'Sin permisos' }

  const { error } = await service.from('pacientes').update({ activo: false }).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
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
