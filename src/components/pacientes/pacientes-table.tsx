'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { obtenerPacientes, eliminarPaciente } from '@/app/(dashboard)/pacientes/nuevo/actions'
import { usePermisos } from '@/hooks/use-permisos'
import type { Paciente } from '@/types'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Search, Eye, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function PacientesTable() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { puede } = usePermisos()
  const puedeEliminar = puede('pacientes', 'eliminar')

  const cargarPacientes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await obtenerPacientes(busqueda)
      setPacientes(data)
    } catch {
      setPacientes([])
    } finally {
      setLoading(false)
    }
  }, [busqueda])

  useEffect(() => {
    const timer = setTimeout(cargarPacientes, 300)
    return () => clearTimeout(timer)
  }, [cargarPacientes])

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const result = await eliminarPaciente(id)
      if (result.error) {
        toast.error('Error: ' + result.error)
        return
      }
      toast.success('Paciente dado de baja')
      setPacientes(prev => prev.filter(p => p.id !== id))
      setConfirmDelete(null)
    } catch {
      toast.error('Error inesperado')
    } finally {
      setDeleting(false)
    }
  }

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
                  <div className="flex items-center justify-end gap-1">
                    {puedeEliminar && (
                      confirmDelete === p.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleting}
                            onClick={() => handleDelete(p.id)}
                          >
                            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : '¿Confirmar?'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deleting}
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setConfirmDelete(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )
                    )}
                    <Link href={`/pacientes/${p.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
