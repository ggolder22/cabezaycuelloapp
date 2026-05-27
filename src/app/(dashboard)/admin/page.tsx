export const dynamic = 'force-dynamic'

import { Shield, Settings, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { obtenerUsuarios } from './actions'
import { ROLES } from '@/config/roles'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function AdminPage() {
  const usuarios = await obtenerUsuarios()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Administración</h2>
        <p className="text-slate-500 text-sm">Gestión del sistema y usuarios</p>
      </div>

      {/* Sección Usuarios */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-800">Usuarios del sistema</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => {
                  const rol = ROLES[u.rol]
                  const nombreCompleto = [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido]
                    .filter(Boolean).join(' ')
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <p className="font-medium text-sm text-slate-900">{nombreCompleto}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{u.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${rol?.color ?? 'bg-slate-100 text-slate-700'}`}>
                          {rol?.label ?? u.rol}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-slate-600">
                        {u.numero_matricula ?? <span className="text-slate-300">—</span>}
                      </TableCell>
                      <TableCell>
                        {u.activo ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <XCircle className="h-3.5 w-3.5" /> Inactivo
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {format(new Date(u.created_at), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Secciones pendientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles y permisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Control de acceso por rol</p>
            <p className="text-xs text-slate-400 mt-1 italic">Próximamente</p>
          </CardContent>
        </Card>
        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Configuración general del sistema</p>
            <p className="text-xs text-slate-400 mt-1 italic">Próximamente</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
