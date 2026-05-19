import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PacienteDetallePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .single()

  if (!paciente) notFound()

  const nombreCompleto = [
    paciente.primer_nombre,
    paciente.segundo_nombre,
    paciente.primer_apellido,
    paciente.segundo_apellido,
  ].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/pacientes" className="text-slate-400 hover:text-slate-700 mt-1">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-slate-900">{nombreCompleto}</h2>
            <Badge className="font-mono text-sm bg-blue-50 text-blue-700 border-blue-200">
              {paciente.numero_historia}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm">
            {paciente.tipo_documento} {paciente.numero_documento} · {paciente.celular}
            {paciente.eps && ` · ${paciente.eps}`}
          </p>
        </div>
      </div>

      <Tabs defaultValue="historia">
        <TabsList>
          <TabsTrigger value="historia">Historia clínica</TabsTrigger>
          <TabsTrigger value="citas">Citas</TabsTrigger>
          <TabsTrigger value="imagenes">Imágenes y archivos</TabsTrigger>
          <TabsTrigger value="formularios">Formularios</TabsTrigger>
          <TabsTrigger value="datos">Datos del paciente</TabsTrigger>
        </TabsList>

        <TabsContent value="historia" className="mt-4">
          <div className="text-slate-500 text-sm py-8 text-center">
            Historia clínica — En construcción
          </div>
        </TabsContent>

        <TabsContent value="citas" className="mt-4">
          <div className="text-slate-500 text-sm py-8 text-center">
            Citas del paciente — En construcción
          </div>
        </TabsContent>

        <TabsContent value="imagenes" className="mt-4">
          <div className="text-slate-500 text-sm py-8 text-center">
            Imágenes y archivos — En construcción
          </div>
        </TabsContent>

        <TabsContent value="formularios" className="mt-4">
          <div className="text-slate-500 text-sm py-8 text-center">
            Formularios especializados (TNM, laringoscopía, etc.) — En construcción
          </div>
        </TabsContent>

        <TabsContent value="datos" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              ['Nombre completo', nombreCompleto],
              ['Documento', `${paciente.tipo_documento} ${paciente.numero_documento}`],
              ['Fecha de nacimiento', paciente.fecha_nacimiento],
              ['Sexo', paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'],
              ['Celular', paciente.celular],
              ['Teléfono', paciente.telefono ?? '—'],
              ['Email', paciente.email ?? '—'],
              ['Dirección', paciente.direccion ?? '—'],
              ['Ciudad', paciente.ciudad ?? '—'],
              ['Departamento', paciente.departamento ?? '—'],
              ['EPS', paciente.eps ?? '—'],
              ['Tipo afiliación', paciente.tipo_afiliacion ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="bg-white border rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
