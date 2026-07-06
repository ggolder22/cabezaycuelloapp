export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { EditarPacienteForm } from '@/components/pacientes/editar-paciente-form'
import type { Paciente } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarPacientePage({ params }: Props) {
  const { id } = await params
  const service = createServiceClient()
  const { data: paciente } = await service.from('pacientes').select('*').eq('id', id).single()

  if (!paciente) notFound()

  const nombreCompleto = [paciente.primer_nombre, paciente.primer_apellido].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pacientes/${id}`} className="text-slate-400 hover:text-slate-700">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Editar paciente</h2>
          <p className="text-slate-500 text-sm">
            {nombreCompleto} · <span className="font-mono text-blue-600">{paciente.numero_historia}</span>
          </p>
        </div>
      </div>

      <EditarPacienteForm paciente={paciente as unknown as Paciente} />
    </div>
  )
}
