import { Calendar } from 'lucide-react'

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Agenda</h2>
        <p className="text-slate-500 text-sm">Gestión de citas y turnos</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white rounded-xl border border-slate-200">
        <Calendar className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500 font-medium">Sección en construcción</p>
        <p className="text-slate-400 text-sm">Próximamente podrás gestionar turnos y citas desde aquí.</p>
      </div>
    </div>
  )
}
