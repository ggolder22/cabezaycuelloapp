export const dynamic = 'force-dynamic'

import { obtenerPendientes, obtenerDiscutidos } from './actions'
import { AteneoTabs } from '@/components/ateneo/ateneo-tabs'
import { Stethoscope } from 'lucide-react'

export default async function AteneoPage() {
  const [pendientes, discutidos] = await Promise.all([
    obtenerPendientes(),
    obtenerDiscutidos(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-50 p-2 rounded-lg">
          <Stethoscope className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ateneo clínico</h2>
          <p className="text-slate-500 text-sm">Casos propuestos para discusión y trazabilidad</p>
        </div>
      </div>

      <AteneoTabs initialPendientes={pendientes} initialDiscutidos={discutidos} />
    </div>
  )
}
