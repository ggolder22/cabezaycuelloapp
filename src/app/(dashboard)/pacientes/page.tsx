import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { PacientesTable } from '@/components/pacientes/pacientes-table'

export default function PacientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pacientes</h2>
          <p className="text-slate-500 text-sm">Gestión y búsqueda de pacientes</p>
        </div>
        <Link href="/pacientes/nuevo" className={buttonVariants()}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo paciente
        </Link>
      </div>

      <PacientesTable />
    </div>
  )
}
