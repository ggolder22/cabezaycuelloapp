'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { registroSchema, type RegistroFormData } from '@/lib/validations/auth'
import { ROLES } from '@/config/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import type { RolUsuario } from '@/types'

const ROLES_DISPONIBLES = Object.entries(ROLES).filter(([rol]) => rol !== 'admin') as [RolUsuario, typeof ROLES[RolUsuario]][]

export default function RegistroPage() {
  const [loading, setLoading] = useState(false)
  const [registrado, setRegistrado] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
  })

  const onSubmit = async (data: RegistroFormData) => {
    setLoading(true)
    try {
      // Crear usuario en Supabase Auth con metadata
      // El trigger handle_new_user() crea automáticamente el perfil en public.usuarios
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            primer_nombre: data.primer_nombre,
            segundo_nombre: data.segundo_nombre || null,
            primer_apellido: data.primer_apellido,
            segundo_apellido: data.segundo_apellido || null,
            rol: data.rol,
          },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Ya existe una cuenta con ese email')
        } else {
          toast.error('Error al crear la cuenta: ' + authError.message)
        }
        setLoading(false)
        return
      }

      setRegistrado(true)
    } catch (err) {
      console.error(err)
      toast.error('Error inesperado. Intente nuevamente.')
      setLoading(false)
    }
  }

  if (registrado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--sidebar)' }}>
        <Card className="w-full max-w-md border-0 shadow-2xl text-center">
          <CardContent className="pt-10 pb-8 px-8 space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">¡Registro exitoso!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tu cuenta fue creada. Revisá tu email para confirmar la dirección
              y luego podés iniciar sesión.
            </p>
            <Button className="w-full mt-2" onClick={() => router.push('/login')}>
              Ir al login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--sidebar)' }}>
      {/* Panel izquierdo — marca */}
      <div className="hidden lg:flex flex-col justify-between w-80 p-10 border-r border-white/10 shrink-0">
        <div>
          <div className="w-12 h-1 rounded-full mb-6" style={{ background: 'var(--brand-red)' }} />
          <h2 className="text-white text-2xl font-bold leading-snug">
            Unidad de<br />Cabeza y Cuello
          </h2>
          <p className="text-white/50 text-sm mt-2">Clínica El Castaño</p>
        </div>
        <Link href="/login" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al login
        </Link>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8 space-y-5">
          <div className="lg:hidden">
            <Link href="/login" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="pb-2">
              <h1 className="text-xl font-bold text-slate-900">Crear cuenta</h1>
              <p className="text-sm text-slate-500">Completá tus datos para acceder al sistema</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Nombre */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Primer nombre *</Label>
                    <Input placeholder="Juan" {...register('primer_nombre')} />
                    {errors.primer_nombre && <p className="text-xs text-red-600">{errors.primer_nombre.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Segundo nombre</Label>
                    <Input placeholder="Carlos" {...register('segundo_nombre')} />
                  </div>
                </div>

                {/* Apellido */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Primer apellido *</Label>
                    <Input placeholder="García" {...register('primer_apellido')} />
                    {errors.primer_apellido && <p className="text-xs text-red-600">{errors.primer_apellido.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Segundo apellido</Label>
                    <Input placeholder="López" {...register('segundo_apellido')} />
                  </div>
                </div>

                {/* Rol */}
                <div className="space-y-1.5">
                  <Label>Rol / Especialidad *</Label>
                  <Select onValueChange={(v) => setValue('rol', v as RegistroFormData['rol'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione su especialidad..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES_DISPONIBLES.map(([rol, info]) => (
                        <SelectItem key={rol} value={rol}>
                          <div className="flex flex-col">
                            <span>{info.label}</span>
                            <span className="text-xs text-slate-400">{info.especialidad}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rol && <p className="text-xs text-red-600">{errors.rol.message}</p>}
                </div>

                <div className="border-t pt-4 space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label>Correo electrónico *</Label>
                    <Input type="email" placeholder="usuario@clinicaelcastano.com" {...register('email')} />
                    {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Contraseña *</Label>
                      <Input type="password" placeholder="Mín. 8 caracteres" {...register('password')} />
                      {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Confirmar contraseña *</Label>
                      <Input type="password" placeholder="Repetir contraseña" {...register('confirmar_password')} />
                      {errors.confirmar_password && <p className="text-xs text-red-600">{errors.confirmar_password.message}</p>}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear cuenta
                </Button>

                <p className="text-center text-sm text-slate-500">
                  ¿Ya tenés cuenta?{' '}
                  <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--brand-red)' }}>
                    Iniciá sesión
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
