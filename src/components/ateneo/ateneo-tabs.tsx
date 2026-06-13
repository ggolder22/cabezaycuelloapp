'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { marcarDiscutido, obtenerPendientes, obtenerDiscutidos, type AteneoItem } from '@/app/(dashboard)/ateneo/actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, Eye, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// ── Marcar discutido (form inline) ───────────────────────────────────────────

function MarcarDiscutidoForm({ item, onDone }: { item: AteneoItem; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [resolucion, setResolucion] = useState('')
  const [pending, startTransition] = useTransition()

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await marcarDiscutido(item.id, resolucion)
      if (result.error) {
        toast.error('Error: ' + result.error)
        return
      }
      toast.success('Caso marcado como discutido')
      onDone()
    })
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50"
        onClick={() => setOpen(true)}>
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        Marcar discutido
      </Button>
    )
  }

  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <p className="text-xs font-medium text-slate-600">Resolución / notas del ateneo</p>
      <textarea
        rows={3}
        className="w-full rounded-md border border-input bg-white px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        placeholder="Conclusiones, conducta acordada, seguimiento..."
        value={resolucion}
        onChange={e => setResolucion(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={handleSubmit}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
          Confirmar
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

// ── Card de caso ─────────────────────────────────────────────────────────────

function CasoCard({ item, modo, onActualizar }: {
  item: AteneoItem
  modo: 'pendiente' | 'discutido'
  onActualizar: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const p = item.pacientes
  const solicitante = item.solicitante

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-slate-900">
              {p.primer_nombre} {p.primer_apellido}
            </span>
            <span className="font-mono text-xs text-blue-600">{p.numero_historia}</span>
            {modo === 'pendiente' && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Pendiente</Badge>
            )}
            {modo === 'discutido' && (
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Discutido</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 line-clamp-1">{item.motivo}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400">
          <span>{format(new Date(item.fecha_solicitud), 'dd MMM yyyy', { locale: es })}</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t bg-slate-50 px-4 py-4 space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Motivo de propuesta</p>
              <p className="text-slate-800">{item.motivo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Propuesto por</p>
              <p className="text-slate-800">
                {solicitante ? `${solicitante.primer_nombre} ${solicitante.primer_apellido}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Fecha de solicitud</p>
              <p className="text-slate-800 capitalize">
                {format(new Date(item.fecha_solicitud), "dd 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            {modo === 'discutido' && item.fecha_discusion && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Fecha de discusión</p>
                <p className="text-slate-800 capitalize">
                  {format(new Date(item.fecha_discusion), "dd 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>
            )}
          </div>

          {modo === 'discutido' && item.resolucion && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Resolución</p>
              <p className="text-slate-800 whitespace-pre-wrap bg-white border rounded-lg px-3 py-2 text-sm">
                {item.resolucion}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/pacientes/${p.id}`}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors border"
            >
              <Eye className="h-3.5 w-3.5" />
              Ver HC del paciente
            </Link>
            {modo === 'pendiente' && (
              <MarcarDiscutidoForm item={item} onDone={onActualizar} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main tabs component ───────────────────────────────────────────────────────

interface Props {
  initialPendientes: AteneoItem[]
  initialDiscutidos: AteneoItem[]
}

export function AteneoTabs({ initialPendientes, initialDiscutidos }: Props) {
  const [pendientes, setPendientes] = useState(initialPendientes)
  const [discutidos, setDiscutidos] = useState(initialDiscutidos)
  const [refreshing, startRefresh] = useTransition()

  const actualizar = () => {
    startRefresh(async () => {
      const [p, d] = await Promise.all([obtenerPendientes(), obtenerDiscutidos()])
      setPendientes(p)
      setDiscutidos(d)
    })
  }

  return (
    <Tabs defaultValue="pendientes">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="pendientes" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendientes
            {pendientes.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-medium">
                {pendientes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="discutidos" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Discutidos
          </TabsTrigger>
        </TabsList>
        {refreshing && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      <TabsContent value="pendientes" className="mt-4">
        {pendientes.length === 0 ? (
          <Card className="py-16 text-center text-slate-400 text-sm">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No hay casos pendientes de ateneo
          </Card>
        ) : (
          <div className="space-y-2">
            {pendientes.map(item => (
              <CasoCard key={item.id} item={item} modo="pendiente" onActualizar={actualizar} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="discutidos" className="mt-4">
        {discutidos.length === 0 ? (
          <Card className="py-16 text-center text-slate-400 text-sm">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Aún no hay casos discutidos
          </Card>
        ) : (
          <div className="space-y-2">
            {discutidos.map(item => (
              <CasoCard key={item.id} item={item} modo="discutido" onActualizar={actualizar} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
