'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import { ROLES } from '@/config/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save } from 'lucide-react'

const perfilSchema = z.object({
  primer_nombre: z.string().min(1, 'Requerido'),
  segundo_nombre: z.string().optional(),
  primer_apellido: z.string().min(1, 'Requerido'),
  segundo_apellido: z.string().optional(),
  numero_matricula: z.string().optional(),
})

type PerfilFormData = z.infer<typeof perfilSchema>

export function PerfilForm() {
  const [saving, setSaving] = useState(false)
  const { usuario, loading, setUsuario } = useAuthStore()
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
  })

  useEffect(() => {
    if (usuario) {
      reset({
        primer_nombre: usuario.primer_nombre,
        segundo_nombre: usuario.segundo_nombre ?? '',
        primer_apellido: usuario.primer_apellido,
        segundo_apellido: usuario.segundo_apellido ?? '',
        numero_matricula: usuario.numero_matricula ?? '',
      })
    }
  }, [usuario, reset])

  const rolInfo = usuario ? ROLES[usuario.rol] : null

  const iniciales = usuario
    ? `${usuario.primer_nombre?.[0] ?? ''}${usuario.primer_apellido?.[0] ?? ''}`.toUpperCase()
    : '?'

  const onSubmit = async (data: PerfilFormData) => {
    if (!usuario) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          primer_nombre: data.primer_nombre.trim(),
          segundo_nombre: data.segundo_nombre?.trim() || null,
          primer_apellido: data.primer_apellido.trim(),
          segundo_apellido: data.segundo_apellido?.trim() || null,
          numero_matricula: data.numero_matricula?.trim() || null,
        })
        .eq('id', usuario.id)

      if (error) {
        toast.error('Error al guardar: ' + error.message)
        return
      }

      setUsuario({
        ...usuario,
        primer_nombre: data.primer_nombre.trim(),
        segundo_nombre: data.segundo_nombre?.trim() || undefined,
        primer_apellido: data.primer_apellido.trim(),
        segundo_apellido: data.segundo_apellido?.trim() || undefined,
        numero_matricula: data.numero_matricula?.trim() || undefined,
      })

      toast.success('Perfil actualizado correctamente')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!usuario) return null

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <div className="flex items-center gap-5 p-6 bg-white rounded-xl border border-slate-200">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-white text-2xl font-bold" style={{ background: 'var(--brand-red)' }}>
            {iniciales}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {usuario.primer_nombre} {usuario.primer_apellido}
          </h3>
          {rolInfo && (
            <Badge className={`mt-1 ${rolInfo.color}`} variant="outline">
              {rolInfo.label}
            </Badge>
          )}
          {usuario.numero_matricula && (
            <p className="text-sm text-slate-500 mt-1">Mat. {usuario.numero_matricula}</p>
          )}
          <p className="text-sm text-slate-400 mt-0.5">{usuario.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Datos profesionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Número de matrícula</Label>
                <Input placeholder="Ej: MP 12345" {...register('numero_matricula')} />
              </div>
              <div className="space-y-1.5">
                <Label>Especialidad</Label>
                <Input value={rolInfo?.especialidad ?? ''} readOnly className="bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Información de cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={usuario.email} readOnly className="bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <Label>Miembro desde</Label>
                <Input
                  value={new Date(usuario.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  readOnly
                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-6">
          <Button type="submit" disabled={saving}>
            {saving
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Save className="mr-2 h-4 w-4" />
            }
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
