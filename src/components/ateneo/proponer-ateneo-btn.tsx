'use client'

import { useState, useTransition } from 'react'
import { proponerAteneo, tienePendiente } from '@/app/(dashboard)/ateneo/actions'
import { Button } from '@/components/ui/button'
import { Stethoscope, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  pacienteId: string
  yaTienePendiente: boolean
}

export function ProponerAteneoBtn({ pacienteId, yaTienePendiente: initial }: Props) {
  const [pendienteExistente, setPendienteExistente] = useState(initial)
  const [open, setOpen] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [submitting, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!motivo.trim()) {
      toast.error('Ingresá el motivo de la propuesta')
      return
    }
    startTransition(async () => {
      const result = await proponerAteneo(pacienteId, motivo)
      if (result.error) {
        toast.error('Error: ' + result.error)
        return
      }
      toast.success('Caso propuesto para ateneo')
      setPendienteExistente(true)
      setOpen(false)
      setMotivo('')
    })
  }

  if (pendienteExistente) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 font-medium">
        <Stethoscope className="h-3.5 w-3.5" />
        Propuesto para ateneo
      </span>
    )
  }

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-indigo-700 border-indigo-300 hover:bg-indigo-50"
        onClick={() => setOpen(true)}
      >
        <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
        Proponer para ateneo
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 min-w-[280px]">
      <textarea
        rows={2}
        autoFocus
        className="w-full rounded-md border border-input bg-white px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        placeholder="Motivo de la propuesta al ateneo..."
        value={motivo}
        onChange={e => setMotivo(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" disabled={submitting} onClick={handleSubmit}>
          {submitting
            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
          Confirmar
        </Button>
        <Button size="sm" variant="ghost" disabled={submitting} onClick={() => { setOpen(false); setMotivo('') }}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
