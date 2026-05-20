import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PerfilForm } from '@/components/perfil/perfil-form'
import type { Usuario } from '@/types'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
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
