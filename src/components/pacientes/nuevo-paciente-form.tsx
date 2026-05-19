'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { pacienteSchema, type PacienteFormData } from '@/lib/validations/paciente'
import { useAuthStore } from '@/stores/auth.store'
import { ESPECIALISTAS_CIRCUITO } from '@/config/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserPlus, AlertTriangle } from 'lucide-react'

type DerivacionTipo = 'urgente' | 'programado'

interface DerivacionState {
  tipo: DerivacionTipo | null
}

function CampoBooleano({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${!checked ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${checked ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
          style={checked ? { background: 'var(--brand-red)' } : undefined}
        >
          Sí
        </button>
      </div>
    </div>
  )
}

export function NuevoPacienteForm() {
  const [loading, setLoading] = useState(false)
  const [derivaciones, setDerivaciones] = useState<Record<string, DerivacionState>>(
    Object.fromEntries(ESPECIALISTAS_CIRCUITO.map(e => [e.nombre, { tipo: null }]))
  )
  const router = useRouter()
  const { usuario } = useAuthStore()
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      antecedentes_oncologicos: false,
      antecedentes_quirurgicos: false,
      alergias: false,
      signos_alarma: false,
      derivaciones: [],
    },
  })

  const antOncologicos = watch('antecedentes_oncologicos')
  const antQuirurgicos = watch('antecedentes_quirurgicos')
  const alergias = watch('alergias')
  const signosAlarma = watch('signos_alarma')

  const toggleDerivacion = (nombre: string, tipo: DerivacionTipo) => {
    setDerivaciones(prev => {
      const actual = prev[nombre].tipo
      const nuevo = actual === tipo ? null : tipo
      const updated = { ...prev, [nombre]: { tipo: nuevo } }
      const lista = Object.entries(updated)
        .filter(([, v]) => v.tipo !== null)
        .map(([n, v]) => {
          const esp = ESPECIALISTAS_CIRCUITO.find(e => e.nombre === n)!
          return { nombre: n, especialidad: esp.especialidad, tipo: v.tipo! }
        })
      setValue('derivaciones', lista)
      return updated
    })
  }

  const onSubmit = async (data: PacienteFormData) => {
    setLoading(true)
    try {
      const { data: paciente, error } = await supabase
        .from('pacientes')
        .insert({ ...data, creado_por: usuario?.id })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        toast.error('Error: ' + error.message)
        setLoading(false)
        return
      }

      toast.success(`Paciente registrado — Historia: ${paciente.numero_historia}`)
      router.push(`/pacientes/${paciente.id}`)
    } catch (err) {
      console.error('Excepción inesperada:', err)
      toast.error('Error inesperado al registrar el paciente')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── SECCIÓN 1: Datos filiatorios ─────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: 'var(--brand-red)' }}>1</span>
            Datos filiatorios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de documento *</Label>
              <Select onValueChange={(v) => setValue('tipo_documento', v as PacienteFormData['tipo_documento'])}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de extranjería</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="PA">Pasaporte</SelectItem>
                  <SelectItem value="RC">Registro civil</SelectItem>
                  <SelectItem value="TI">Tarjeta de identidad</SelectItem>
                  <SelectItem value="NIT">NIT</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_documento && <p className="text-xs text-red-600">{errors.tipo_documento.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Número de documento *</Label>
              <Input placeholder="Ej: 12345678" {...register('numero_documento')} />
              {errors.numero_documento && <p className="text-xs text-red-600">{errors.numero_documento.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de nacimiento *</Label>
              <Input type="date" {...register('fecha_nacimiento')} />
              {errors.fecha_nacimiento && <p className="text-xs text-red-600">{errors.fecha_nacimiento.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Primer nombre *</Label>
              <Input {...register('primer_nombre')} />
              {errors.primer_nombre && <p className="text-xs text-red-600">{errors.primer_nombre.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Segundo nombre</Label>
              <Input {...register('segundo_nombre')} />
            </div>
            <div className="space-y-1.5">
              <Label>Primer apellido *</Label>
              <Input {...register('primer_apellido')} />
              {errors.primer_apellido && <p className="text-xs text-red-600">{errors.primer_apellido.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Segundo apellido</Label>
              <Input {...register('segundo_apellido')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Sexo *</Label>
              <Select onValueChange={(v) => setValue('sexo', v as PacienteFormData['sexo'])}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                  <SelectItem value="O">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.sexo && <p className="text-xs text-red-600">{errors.sexo.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Celular *</Label>
              <Input placeholder="3001234567" {...register('celular')} />
              {errors.celular && <p className="text-xs text-red-600">{errors.celular.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono fijo</Label>
              <Input placeholder="2614567890" {...register('telefono')} />
            </div>
            <div className="space-y-1.5">
              <Label>Obra social / Prepaga</Label>
              <Input placeholder="Ej: OSDE, Swiss Medical..." {...register('eps')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de derivación *</Label>
              <Select onValueChange={(v) => setValue('tipo_derivacion', v as PacienteFormData['tipo_derivacion'])}>
                <SelectTrigger><SelectValue placeholder="¿Cómo llega el paciente?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="espontanea">Espontánea</SelectItem>
                  <SelectItem value="imagenes">Imágenes</SelectItem>
                  <SelectItem value="interconsulta">Interconsulta</SelectItem>
                  <SelectItem value="urgencias">Urgencias</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_derivacion && <p className="text-xs text-red-600">{errors.tipo_derivacion.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de afiliación</Label>
              <Select onValueChange={(v) => setValue('tipo_afiliacion', v as PacienteFormData['tipo_afiliacion'])}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contributivo">Contributivo</SelectItem>
                  <SelectItem value="subsidiado">Subsidiado</SelectItem>
                  <SelectItem value="vinculado">Vinculado</SelectItem>
                  <SelectItem value="particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Motivo de consulta *</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-[70px]"
              placeholder="Describa el motivo principal de la consulta..."
              {...register('motivo_consulta')}
            />
            {errors.motivo_consulta && <p className="text-xs text-red-600">{errors.motivo_consulta.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 2: Antecedentes ──────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: 'var(--brand-red)' }}>2</span>
            Antecedentes <span className="text-slate-400 font-normal">(solo relevantes)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <CampoBooleano
              label="Oncológicos:"
              checked={antOncologicos}
              onChange={(v) => setValue('antecedentes_oncologicos', v)}
            />
            {antOncologicos && (
              <Input placeholder="Especifique tipo y estadio..." {...register('antecedentes_oncologicos_detalle')} />
            )}
          </div>

          <div className="space-y-3">
            <CampoBooleano
              label="Quirúrgicos relevantes:"
              checked={antQuirurgicos}
              onChange={(v) => setValue('antecedentes_quirurgicos', v)}
            />
            {antQuirurgicos && (
              <Input placeholder="Especifique cirugías previas..." {...register('antecedentes_quirurgicos_detalle')} />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Comorbilidades relevantes</Label>
            <Input placeholder="Ej: HTA, DBT, IRC..." {...register('comorbilidades')} />
          </div>

          <div className="space-y-1.5">
            <Label>Medicación de impacto <span className="text-slate-400 font-normal">(ACO, inmunosupresores, etc.)</span></Label>
            <Input placeholder="Ej: Warfarina, Metotrexato..." {...register('medicacion_impacto')} />
          </div>

          <div className="space-y-3">
            <CampoBooleano
              label="Alergias relevantes:"
              checked={alergias}
              onChange={(v) => setValue('alergias', v)}
            />
            {alergias && (
              <Input placeholder="Especifique alergias..." {...register('alergias_detalle')} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 3: Examen clínico dirigido ───────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: 'var(--brand-red)' }}>3</span>
            Examen clínico dirigido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Estado general *</Label>
            <div className="flex gap-2">
              {(['conservado', 'regular', 'comprometido'] as const).map((estado) => {
                const estadoActual = watch('estado_general')
                const colores = {
                  conservado: 'border-green-500 bg-green-50 text-green-800',
                  regular: 'border-yellow-500 bg-yellow-50 text-yellow-800',
                  comprometido: 'border-red-500 bg-red-50 text-red-800',
                }
                return (
                  <button
                    key={estado}
                    type="button"
                    onClick={() => setValue('estado_general', estado)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors capitalize ${estadoActual === estado ? colores[estado] : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </button>
                )
              })}
            </div>
            {errors.estado_general && <p className="text-xs text-red-600">{errors.estado_general.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CampoBooleano
                label="Signos de alarma:"
                checked={signosAlarma}
                onChange={(v) => setValue('signos_alarma', v)}
              />
              {signosAlarma && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-semibold">ATENCIÓN</span>
                </div>
              )}
            </div>
            {signosAlarma && (
              <textarea
                className="w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 min-h-[60px]"
                placeholder="Describa los signos de alarma encontrados..."
                {...register('signos_alarma_detalle')}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Observaciones</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-[60px]"
              placeholder="Observaciones del examen clínico..."
              {...register('observaciones_ingreso')}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 4: Circuito asistencial ──────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: 'var(--brand-red)' }}>4</span>
            Derivación / Circuito asistencial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Profesional</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700 w-28">Urgente</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700 w-28">Programado</th>
                </tr>
              </thead>
              <tbody>
                {ESPECIALISTAS_CIRCUITO.map((esp, i) => {
                  const estado = derivaciones[esp.nombre]
                  return (
                    <tr key={esp.nombre} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{esp.nombre}</p>
                        <p className="text-xs text-slate-500">{esp.especialidad}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleDerivacion(esp.nombre, 'urgente')}
                          className={`w-6 h-6 rounded border-2 mx-auto flex items-center justify-center transition-colors ${estado.tipo === 'urgente' ? 'border-transparent' : 'border-slate-300 hover:border-slate-400'}`}
                          style={estado.tipo === 'urgente' ? { background: 'var(--brand-red)', borderColor: 'var(--brand-red)' } : undefined}
                        >
                          {estado.tipo === 'urgente' && <span className="text-white text-xs">✓</span>}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleDerivacion(esp.nombre, 'programado')}
                          className={`w-6 h-6 rounded border-2 mx-auto flex items-center justify-center transition-colors ${estado.tipo === 'programado' ? 'border-transparent' : 'border-slate-300 hover:border-slate-400'}`}
                          style={estado.tipo === 'programado' ? { background: 'var(--brand-orange)', borderColor: 'var(--brand-orange)' } : undefined}
                        >
                          {estado.tipo === 'programado' && <span className="text-white text-xs">✓</span>}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Resumen de derivaciones seleccionadas */}
          {Object.values(derivaciones).some(d => d.tipo !== null) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {ESPECIALISTAS_CIRCUITO.filter(e => derivaciones[e.nombre].tipo !== null).map(esp => (
                <Badge
                  key={esp.nombre}
                  variant="secondary"
                  className={derivaciones[esp.nombre].tipo === 'urgente' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}
                >
                  {esp.nombre} — {derivaciones[esp.nombre].tipo}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ACCIONES ─────────────────────────────────────────── */}
      <div className="flex gap-3 justify-end pb-6">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <UserPlus className="mr-2 h-4 w-4" />
          }
          Registrar ingreso
        </Button>
      </div>
    </form>
  )
}
