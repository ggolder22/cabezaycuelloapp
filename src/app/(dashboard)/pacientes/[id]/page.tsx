export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ChevronLeft, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { NuevaEvolucionForm } from '@/components/pacientes/nueva-evolucion-form'
import { EvolucionesLista } from '@/components/pacientes/evoluciones-lista'

interface Props {
  params: Promise<{ id: string }>
}

// ─── helpers ────────────────────────────────────────────────────────────────

function BoolBadge({ value, label }: { value: boolean; label: string }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 text-xs font-medium">
      <AlertTriangle className="h-3 w-3" /> {label}: Sí
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 text-xs font-medium">
      <CheckCircle2 className="h-3 w-3" /> {label}: No
    </span>
  )
}

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value || '—'}</p>
    </div>
  )
}

function Seccion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">{title}</h3>
      {children}
    </div>
  )
}

const TIPO_DERIVACION_LABEL: Record<string, string> = {
  espontanea: 'Espontánea',
  imagenes: 'Imágenes diagnósticas',
  interconsulta: 'Interconsulta',
  urgencias: 'Urgencias',
}

const ESTADO_GENERAL_COLOR: Record<string, string> = {
  conservado: 'text-green-700 bg-green-50 border-green-200',
  regular: 'text-amber-700 bg-amber-50 border-amber-200',
  comprometido: 'text-red-700 bg-red-50 border-red-200',
}

// ─── page ───────────────────────────────────────────────────────────────────

export default async function PacienteDetallePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: paciente }, { data: evoluciones }] = await Promise.all([
    supabase.from('pacientes').select('*').eq('id', id).single(),
    supabase
      .from('evoluciones')
      .select('*')
      .eq('paciente_id', id)
      .order('fecha', { ascending: false }),
  ])

  if (!paciente) notFound()

  const nombreCompleto = [
    paciente.primer_nombre,
    paciente.segundo_nombre,
    paciente.primer_apellido,
    paciente.segundo_apellido,
  ].filter(Boolean).join(' ')

  const derivaciones: Array<{ nombre: string; especialidad: string; tipo: string }> =
    paciente.derivaciones ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
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

        {/* ── Historia clínica ── */}
        <TabsContent value="historia" className="mt-4 space-y-4">

          {/* Planilla de ingreso */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-800">Planilla de ingreso</h3>

            {/* Motivo + derivación */}
            <Seccion title="Motivo de consulta">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo label="Motivo" value={paciente.motivo_consulta} />
                <Campo
                  label="Tipo de derivación"
                  value={TIPO_DERIVACION_LABEL[paciente.tipo_derivacion] ?? paciente.tipo_derivacion}
                />
              </div>
            </Seccion>

            {/* Antecedentes */}
            <Seccion title="Antecedentes">
              <div className="flex flex-wrap gap-2 pb-1">
                <BoolBadge value={!!paciente.antecedentes_oncologicos} label="Oncológicos" />
                <BoolBadge value={!!paciente.antecedentes_quirurgicos} label="Quirúrgicos" />
                <BoolBadge value={!!paciente.alergias} label="Alergias" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {paciente.antecedentes_oncologicos && (
                  <Campo label="Detalle oncológicos" value={paciente.antecedentes_oncologicos_detalle} />
                )}
                {paciente.antecedentes_quirurgicos && (
                  <Campo label="Detalle quirúrgicos" value={paciente.antecedentes_quirurgicos_detalle} />
                )}
                {paciente.alergias && (
                  <Campo label="Detalle alergias" value={paciente.alergias_detalle} />
                )}
                <Campo label="Comorbilidades" value={paciente.comorbilidades} />
                <Campo label="Medicación con impacto" value={paciente.medicacion_impacto} />
              </div>
            </Seccion>

            {/* Examen clínico */}
            <Seccion title="Examen clínico dirigido">
              <div className="flex flex-wrap gap-2 items-center">
                {paciente.estado_general && (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${ESTADO_GENERAL_COLOR[paciente.estado_general] ?? ''}`}>
                    Estado general: {paciente.estado_general.charAt(0).toUpperCase() + paciente.estado_general.slice(1)}
                  </span>
                )}
                <BoolBadge value={!!paciente.signos_alarma} label="Signos de alarma" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {paciente.signos_alarma && (
                  <Campo label="Detalle signos de alarma" value={paciente.signos_alarma_detalle} />
                )}
                <Campo label="Observaciones de ingreso" value={paciente.observaciones_ingreso} />
              </div>
            </Seccion>

            {/* Circuito asistencial */}
            {derivaciones.length > 0 && (
              <Seccion title="Circuito asistencial / Derivaciones">
                <div className="space-y-2">
                  {derivaciones.map((d, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium text-slate-800">{d.nombre}</span>
                        <span className="text-slate-500 ml-2">— {d.especialidad}</span>
                      </div>
                      <Badge className={d.tipo === 'urgente'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                      }>
                        {d.tipo === 'urgente' ? 'Urgente' : 'Programado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Seccion>
            )}
          </div>

          {/* Evoluciones */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Evoluciones y procedimientos</h3>
              <NuevaEvolucionForm pacienteId={id} />
            </div>

            {(!evoluciones || evoluciones.length === 0) ? (
              <div className="bg-white border rounded-xl py-10 text-center text-slate-400 text-sm">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Sin evoluciones registradas
              </div>
            ) : (
              <EvolucionesLista evoluciones={evoluciones} />
            )}
          </div>
        </TabsContent>

        {/* ── Citas ── */}
        <TabsContent value="citas" className="mt-4">
          <div className="text-slate-500 text-sm py-8 text-center">
            Citas del paciente — En construcción
          </div>
        </TabsContent>

        {/* ── Imágenes ── */}
        <TabsContent value="imagenes" className="mt-4">
          <div className="text-slate-500 text-sm py-8 text-center">
            Imágenes y archivos — En construcción
          </div>
        </TabsContent>

        {/* ── Formularios ── */}
        <TabsContent value="formularios" className="mt-4">
          <div className="text-slate-500 text-sm py-8 text-center">
            Formularios especializados (TNM, laringoscopía, etc.) — En construcción
          </div>
        </TabsContent>

        {/* ── Datos del paciente ── */}
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
              ['EPS / Prepaga', paciente.eps ?? '—'],
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
