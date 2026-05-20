import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { PerfilForm } from '@/components/perfil/perfil-form'
import type { Usuario } from '@/types'

export default async function PerfilPage() {
  // Auth: quién es el usuario logueado (usa cookies)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Datos: service role bypasea RLS (solo se ejecuta server-side)
  const service = createServiceClient()
  const { data: perfil } = await service
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mi perfil</h2>
        </div>
        <p className="text-slate-500 text-sm">
          No se encontró tu perfil en el sistema. Contactá al administrador.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mi perfil</h2>
        <p className="text-slate-500 text-sm">Actualizá tus datos personales y profesionales</p>
      </div>

      <PerfilForm initialData={perfil as Usuario} />
    </div>
  )
}
