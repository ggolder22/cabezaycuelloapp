import { PerfilForm } from '@/components/perfil/perfil-form'

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mi perfil</h2>
        <p className="text-slate-500 text-sm">Actualizá tus datos personales y profesionales</p>
      </div>

      <PerfilForm />
    </div>
  )
}
