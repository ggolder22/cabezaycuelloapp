'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { PlusCircle, Loader2 } from 'lucide-react'
import { registrarEvolucion } from '@/app/(dashboard)/pacientes/[id]/actions'
import { RFLCFields } from './rflc-fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'

const TIPOS = [
  { value: 'nota',                    label: 'Nota de evolución' },
  { value: 'consulta',                label: 'Consulta' },
  { value: 'procedimiento',           label: 'Procedimiento' },
  { value: 'orden',                   label: 'Orden médica' },
  { value: 'resultado',               label: 'Resultado / Informe' },
  { value: 'interconsulta',           label: 'Interconsulta' },
  { value: 'rinofibrolaringoscopia',  label: 'Rinofibrolaringoscopía (RFLC)' },
] as const

const TIPO_VALUES = TIPOS.map(t => t.value) as [string, ...string[]]

const schema = z.object({
  tipo: z.enum(TIPO_VALUES as [string, ...string[]]),
  descripcion: z.string().min(5, 'Ingrese la descripción').max(5000),
  diagnostico: z.string().max(300).optional(),
  numero_matricula: z.string().min(2, 'Ingrese número de matrícula').max(50),
})

type FormData = z.infer<typeof schema>

export function NuevaEvolucionForm({ pacienteId }: { pacienteId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tipoActual, setTipoActual] = useState<string>('nota')
  const router = useRouter()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'nota', descripcion: '' },
  })

  const handleTipoChange = (v: string | null) => {
    const val = v ?? 'nota'
    setTipoActual(val)
    setValue('tipo', val)
    setValue('descripcion', '')
  }

  const handleRFLCChange = useCallback((text: string) => {
    setValue('descripcion', text)
  }, [setValue])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await registrarEvolucion({
        paciente_id: pacienteId,
        tipo: data.tipo,
        descripcion: data.descripcion,
        diagnostico: data.diagnostico || null,
        numero_matricula: data.numero_matricula,
      })
      if (result.error) {
        toast.error('Error: ' + result.error)
        return
      }
      toast.success('Evolución registrada')
      reset()
      setTipoActual('nota')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Error inesperado al guardar la evolución')
    } finally {
      setLoading(false)
    }
  }

  const esRFLC = tipoActual === 'rinofibrolaringoscopia'

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Nueva evolución
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle>Registrar evolución / procedimiento</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select defaultValue="nota" onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-xs text-red-600">{errors.tipo.message}</p>}
            </div>

            {/* Campos según tipo */}
            {esRFLC ? (
              <div className="space-y-1.5">
                <Label>Informe estructurado</Label>
                <div className="border rounded-lg p-3 bg-slate-50">
                  <RFLCFields onChange={handleRFLCChange} />
                </div>
                {errors.descripcion && <p className="text-xs text-red-600">{errors.descripcion.message}</p>}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Descripción *</Label>
                <textarea
                  {...register('descripcion')}
                  rows={6}
                  placeholder="Describa la evolución, procedimiento o indicación..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
                {errors.descripcion && <p className="text-xs text-red-600">{errors.descripcion.message}</p>}
              </div>
            )}

            {/* Diagnóstico CIE-10 */}
            <div className="space-y-1.5">
              <Label>Diagnóstico / CIE-10</Label>
              <Input placeholder="Ej: C32.0 — Neoplasia maligna de laringe" {...register('diagnostico')} />
            </div>

            {/* Matrícula */}
            <div className="space-y-1.5">
              <Label>Matrícula profesional *</Label>
              <Input placeholder="Ej: MP 12345" {...register('numero_matricula')} />
              {errors.numero_matricula && <p className="text-xs text-red-600">{errors.numero_matricula.message}</p>}
              <p className="text-xs text-slate-400">Número de matrícula habilitante del profesional actuante</p>
            </div>

            <SheetFooter className="p-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
