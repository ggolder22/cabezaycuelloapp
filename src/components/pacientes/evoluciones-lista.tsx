'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Evolucion {
  id: string
  fecha: string
  tipo: string
  descripcion: string
  diagnostico?: string | null
  numero_matricula: string
}

const TIPO_LABEL: Record<string, string> = {
  nota: 'Nota de evolución',
  consulta: 'Consulta',
  procedimiento: 'Procedimiento',
  orden: 'Orden médica',
  resultado: 'Resultado / Informe',
  interconsulta: 'Interconsulta',
}

const TIPO_COLOR: Record<string, string> = {
  nota: 'bg-slate-100 text-slate-700 border-slate-200',
  consulta: 'bg-blue-50 text-blue-700 border-blue-200',
  procedimiento: 'bg-purple-50 text-purple-700 border-purple-200',
  orden: 'bg-amber-50 text-amber-700 border-amber-200',
  resultado: 'bg-green-50 text-green-700 border-green-200',
  interconsulta: 'bg-cyan-50 text-cyan-700 border-cyan-200',
}

function EvolucionCard({ ev }: { ev: Evolucion }) {
  const [open, setOpen] = useState(false)
  const fecha = new Date(ev.fecha)

  const fechaStr = fecha.toLocaleDateString('es-AR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
  const horaStr = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* Cabecera siempre visible — clickeable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Badge className={`text-xs shrink-0 ${TIPO_COLOR[ev.tipo] ?? 'bg-slate-100 text-slate-700'}`}>
            {TIPO_LABEL[ev.tipo] ?? ev.tipo}
          </Badge>
          {ev.diagnostico && (
            <span className="text-xs text-slate-500 font-mono truncate">{ev.diagnostico}</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right text-xs text-slate-400 hidden sm:block">
            <p className="font-medium text-slate-600 capitalize">{fechaStr}</p>
            <p>{horaStr} · Mat. {ev.numero_matricula}</p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Info móvil (solo se ve en sm:hidden) */}
      <div className="px-4 pb-2 text-xs text-slate-400 sm:hidden border-t">
        <p className="capitalize pt-2">{fechaStr} · {horaStr}</p>
        <p>Mat. {ev.numero_matricula}</p>
      </div>

      {/* Contenido expandible */}
      {open && (
        <div className="border-t bg-slate-50 px-4 py-4 space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Tipo</p>
              <p className="font-medium text-slate-800">{TIPO_LABEL[ev.tipo] ?? ev.tipo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Fecha y hora</p>
              <p className="font-medium text-slate-800 capitalize">{fechaStr}</p>
              <p className="text-slate-600">{horaStr} hs</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Matrícula profesional</p>
              <p className="font-medium text-slate-800">{ev.numero_matricula}</p>
            </div>
          </div>

          {ev.diagnostico && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Diagnóstico / CIE-10</p>
              <p className="text-sm font-medium text-slate-800">{ev.diagnostico}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 mb-1">Descripción</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-white border rounded-lg px-3 py-2">
              {ev.descripcion}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function EvolucionesLista({ evoluciones }: { evoluciones: Evolucion[] }) {
  return (
    <div className="space-y-2">
      {evoluciones.map((ev) => (
        <EvolucionCard key={ev.id} ev={ev} />
      ))}
    </div>
  )
}
