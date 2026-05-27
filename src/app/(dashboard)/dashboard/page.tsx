export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, Activity, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TIPO_LABEL: Record<string, string> = {
  nota: 'Nota',
  consulta: 'Consulta',
  procedimiento: 'Procedimiento',
  orden: 'Orden',
  resultado: 'Resultado',
  interconsulta: 'Interconsulta',
  rinofibrolaringoscopia: 'RFLC',
}

const TIPO_COLOR: Record<string, string> = {
  nota: 'bg-slate-100 text-slate-700',
  consulta: 'bg-blue-50 text-blue-700',
  procedimiento: 'bg-purple-50 text-purple-700',
  orden: 'bg-amber-50 text-amber-700',
  resultado: 'bg-green-50 text-green-700',
  interconsulta: 'bg-cyan-50 text-cyan-700',
  rinofibrolaringoscopia: 'bg-rose-50 text-rose-700',
}

export default async function DashboardPage() {
  const service = createServiceClient()

  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalPacientes },
    { count: nuevosEsteMes },
    { count: evolucionesEsteMes },
    { data: actividadReciente },
    { data: pacientesRecientes },
  ] = await Promise.all([
    service.from('pacientes').select('*', { count: 'exact', head: true }).eq('activo', true),
    service.from('pacientes').select('*', { count: 'exact', head: true }).eq('activo', true).gte('created_at', inicioMes),
    service.from('evoluciones').select('*, pacientes!inner(activo)', { count: 'exact', head: true }).eq('pacientes.activo', true).gte('fecha', inicioMes),
    service
      .from('evoluciones')
      .select('id, fecha, tipo, diagnostico, numero_matricula, pacientes!inner(id, primer_nombre, primer_apellido, numero_historia)')
      .eq('pacientes.activo', true)
      .order('fecha', { ascending: false })
      .limit(8),
    service
      .from('pacientes')
      .select('id, numero_historia, primer_nombre, primer_apellido, eps, created_at')
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    {
      label: 'Total pacientes',
      value: totalPacientes ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Nuevos este mes',
      value: nuevosEsteMes ?? 0,
      icon: UserPlus,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Evoluciones este mes',
      value: evolucionesEsteMes ?? 0,
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Mes actual',
      value: format(now, 'MMMM yyyy', { locale: es }),
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      isText: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 text-sm">Resumen del sistema clínico</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className={`font-bold text-slate-900 ${stat.isText ? 'text-lg capitalize' : 'text-3xl'}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Actividad reciente */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-semibold text-slate-800">Actividad reciente</h3>
          <Card>
            {!actividadReciente || actividadReciente.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Sin actividad registrada
              </div>
            ) : (
              <div className="divide-y">
                {actividadReciente.map((ev) => {
                  const p = ev.pacientes as unknown as { id: string; primer_nombre: string; primer_apellido: string; numero_historia: string } | null
                  if (!p) return null
                  return (
                    <Link
                      key={ev.id}
                      href={`/pacientes/${p.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {p.primer_nombre} {p.primer_apellido}
                          </span>
                          <span className="font-mono text-xs text-blue-600 shrink-0">{p.numero_historia}</span>
                        </div>
                        {ev.diagnostico && (
                          <p className="text-xs text-slate-400 truncate">{ev.diagnostico}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-xs ${TIPO_COLOR[ev.tipo] ?? 'bg-slate-100 text-slate-700'}`}>
                          {TIPO_LABEL[ev.tipo] ?? ev.tipo}
                        </Badge>
                        <span className="text-xs text-slate-400 hidden sm:block">
                          {format(new Date(ev.fecha), 'dd MMM', { locale: es })}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Últimos pacientes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Últimos registrados</h3>
            <Link href="/pacientes" className="text-xs text-slate-400 hover:text-slate-700">
              Ver todos →
            </Link>
          </div>
          <Card>
            {!pacientesRecientes || pacientesRecientes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Sin pacientes
              </div>
            ) : (
              <div className="divide-y">
                {pacientesRecientes.map((p) => (
                  <Link
                    key={p.id}
                    href={`/pacientes/${p.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {p.primer_nombre} {p.primer_apellido}
                      </p>
                      <p className="text-xs text-slate-400">{p.eps ?? 'Sin EPS'}</p>
                    </div>
                    <span className="font-mono text-xs text-blue-600 shrink-0 ml-2">{p.numero_historia}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}
