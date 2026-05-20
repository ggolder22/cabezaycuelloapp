export const dynamic = 'force-dynamic'

import { obtenerEvolucionesGlobales } from './actions'
import { EvolucionesGlobales } from '@/components/historia-clinica/evoluciones-globales'

export default async function HistoriaClinicaPage() {
  const evoluciones = await obtenerEvolucionesGlobales()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Historia Clínica</h2>
        <p className="text-slate-500 text-sm">Actividad clínica de todos los pacientes</p>
      </div>
      <EvolucionesGlobales initialData={evoluciones} />
    </div>
  )
}
