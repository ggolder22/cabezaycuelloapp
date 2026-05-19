import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, FileText, Clock } from 'lucide-react'

const stats = [
  { label: 'Pacientes registrados', value: '—', icon: Users, color: 'text-blue-600' },
  { label: 'Citas hoy', value: '—', icon: Calendar, color: 'text-green-600' },
  { label: 'Historias activas', value: '—', icon: FileText, color: 'text-purple-600' },
  { label: 'Próxima cita', value: '—', icon: Clock, color: 'text-orange-600' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 text-sm">Resumen del sistema clínico</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
