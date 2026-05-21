'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { obtenerEvolucionesGlobales, type EvolucionGlobal } from '@/app/(dashboard)/historia-clinica/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Eye, Loader2, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TIPO_LABEL: Record<string, string> = {
  nota: 'Nota de evolución',
  consulta: 'Consulta',
  procedimiento: 'Procedimiento',
  orden: 'Orden médica',
  resultado: 'Resultado / Informe',
  interconsulta: 'Interconsulta',
  rinofibrolaringoscopia: 'RFLC',
}

const TIPO_COLOR: Record<string, string> = {
  nota: 'bg-slate-100 text-slate-700 border-slate-200',
  consulta: 'bg-blue-50 text-blue-700 border-blue-200',
  procedimiento: 'bg-purple-50 text-purple-700 border-purple-200',
  orden: 'bg-amber-50 text-amber-700 border-amber-200',
  resultado: 'bg-green-50 text-green-700 border-green-200',
  interconsulta: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  rinofibrolaringoscopia: 'bg-rose-50 text-rose-700 border-rose-200',
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

interface Props {
  initialData: EvolucionGlobal[]
}

export function EvolucionesGlobales({ initialData }: Props) {
  const [evoluciones, setEvoluciones] = useState<EvolucionGlobal[]>(initialData)
  const [tipo, setTipo] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [pending, startTransition] = useTransition()

  const aplicarFiltros = (t: string, d: string, h: string) => {
    startTransition(async () => {
      const data = await obtenerEvolucionesGlobales({
        tipo: t || undefined,
        desde: d || undefined,
        hasta: h || undefined,
      })
      setEvoluciones(data)
    })
  }

  const filtrarHoy = () => {
    const d = hoy()
    setDesde(d)
    setHasta(d)
    setTipo('')
    aplicarFiltros('', d, d)
  }

  const limpiar = () => {
    setTipo('')
    setDesde('')
    setHasta('')
    aplicarFiltros('', '', '')
  }

  const hayFiltros = tipo || desde || hasta

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 min-w-[160px]">
            <p className="text-xs text-slate-500 font-medium">Tipo</p>
            <Select value={tipo} onValueChange={(v: string | null) => {
              const val = !v || v === 'todos' ? '' : v
              setTipo(val)
              aplicarFiltros(val, desde, hasta)
            }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {Object.entries(TIPO_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Desde</p>
            <Input
              type="date"
              className="h-9 w-40"
              value={desde}
              onChange={(e) => {
                setDesde(e.target.value)
                aplicarFiltros(tipo, e.target.value, hasta)
              }}
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Hasta</p>
            <Input
              type="date"
              className="h-9 w-40"
              value={hasta}
              onChange={(e) => {
                setHasta(e.target.value)
                aplicarFiltros(tipo, desde, e.target.value)
              }}
            />
          </div>

          <Button variant="outline" size="sm" className="h-9" onClick={filtrarHoy}>
            Hoy
          </Button>

          {hayFiltros && (
            <Button variant="ghost" size="sm" className="h-9 text-slate-500" onClick={limpiar}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}

          {pending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead className="hidden sm:table-cell"># Historia</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Diagnóstico</TableHead>
              <TableHead className="hidden lg:table-cell">Matrícula</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evoluciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <Filter className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No hay evoluciones para los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              evoluciones.map((ev) => {
                const p = ev.pacientes
                const nombreCompleto = `${p.primer_nombre} ${p.primer_apellido}`
                return (
                  <TableRow key={ev.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm">
                      <p className="font-medium text-slate-800">
                        {format(new Date(ev.fecha), 'dd MMM yyyy', { locale: es })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(ev.fecha), 'HH:mm')} hs
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm text-slate-900">{nombreCompleto}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-mono text-sm font-semibold text-blue-700">
                        {p.numero_historia}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${TIPO_COLOR[ev.tipo] ?? 'bg-slate-100 text-slate-700'}`}>
                        {TIPO_LABEL[ev.tipo] ?? ev.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">
                      {ev.diagnostico ?? '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-slate-500 font-mono">
                      {ev.numero_matricula}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/pacientes/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver HC
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        {evoluciones.length > 0 && (
          <div className="px-4 py-2 border-t text-xs text-slate-400 text-right">
            {evoluciones.length} registro{evoluciones.length !== 1 ? 's' : ''}
          </div>
        )}
      </Card>
    </div>
  )
}
