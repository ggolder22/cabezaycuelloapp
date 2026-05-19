import { NuevoPacienteForm } from '@/components/pacientes/nuevo-paciente-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NuevoPacientePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pacientes" className="text-slate-400 hover:text-slate-700">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admisión de Paciente</h2>
          <p className="text-slate-500 text-sm">Registro de nuevo paciente con ID único trazable</p>
        </div>
      </div>

      <NuevoPacienteForm />
    </div>
  )
}
