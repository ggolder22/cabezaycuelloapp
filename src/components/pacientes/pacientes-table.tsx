'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Paciente } from '@/types'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Search, Eye, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function PacientesTable() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const supabase = createClient()

  const cargarPacientes = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('pacientes')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (busqueda) {
      query = query.or(
        `primer_nombre.ilike.%${busqueda}%,primer_apellido.ilike.%${busqueda}%,numero_documento.ilike.%${busqueda}%,numero_historia.ilike.%${busqueda}%`
      )
    }

    const { data } = await query.limit(50)
    setPacientes(data ?? [])
    setLoading(false)
  }, [busqueda])

  useEffect(() => {
    const timer = setTimeout(cargarPacientes, 300)
    return () => clearTimeout(timer)
  }, [cargarPacientes])

  return (
    <Card>
      <div className="p-4 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, documento o # historia..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead># Historia</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>EPS / Afiliación</TableHead>
            <TableHead>Fecha ingreso</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" />
              </TableCell>
            </TableRow>
          ) : pacientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                No se encontraron pacientes
              </TableCell>
            </TableRow>
          ) : (
            pacientes.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm font-semibold text-blue-700">
                  {p.numero_historia}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{p.primer_nombre} {p.segundo_nombre} {p.primer_apellido} {p.segundo_apellido}</p>
                    <p className="text-xs text-slate-500">{p.celular}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{p.tipo_documento} {p.numero_documento}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">{p.eps ?? '—'}</p>
                    {p.tipo_afiliacion && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {p.tipo_afiliacion}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {format(new Date(p.created_at), 'dd MMM yyyy', { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/pacientes/${p.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
