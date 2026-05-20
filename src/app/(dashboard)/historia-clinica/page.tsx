import { FileText } from 'lucide-react'

export default function HistoriaClinicaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Historia Clínica</h2>
        <p className="text-slate-500 text-sm">Gestión de historias clínicas</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white rounded-xl border border-slate-200">
        <FileText className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500 font-medium">Sección en construcción</p>
        <p className="text-slate-400 text-sm">Accedé a la historia clínica desde el perfil de cada paciente.</p>
      </div>
    </div>
  )
}
