import { ImageIcon } from 'lucide-react'

export default function ImagenesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Imágenes</h2>
        <p className="text-slate-500 text-sm">Archivos e imágenes diagnósticas</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white rounded-xl border border-slate-200">
        <ImageIcon className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500 font-medium">Sección en construcción</p>
        <p className="text-slate-400 text-sm">Próximamente podrás gestionar imágenes diagnósticas desde aquí.</p>
      </div>
    </div>
  )
}
