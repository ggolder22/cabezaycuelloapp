import { Shield, Users, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Administración</h2>
        <p className="text-slate-500 text-sm">Gestión del sistema y usuarios</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Gestión de usuarios y accesos</p>
            <p className="text-xs text-slate-400 mt-1 italic">Próximamente</p>
          </CardContent>
        </Card>
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
