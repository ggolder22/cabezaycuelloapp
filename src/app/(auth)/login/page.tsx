'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Credenciales incorrectas. Verifique su email y contraseña.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--sidebar)' }}>
      {/* Panel izquierdo — marca */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 border-r border-white/10">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Clínica El Castaño"
            width={50}
            height={50}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <p className="text-white font-bold">Unidad de Cabeza y Cuello</p>
            <p className="text-white/60 text-sm">Clínica El Castaño</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="w-12 h-1 rounded-full" style={{ background: 'var(--brand-red)' }} />
          <h2 className="text-white text-2xl font-bold leading-snug">
            Sistema de Gestión<br />de Pacientes
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Historia clínica · Admisión · Agenda<br />
            Imágenes · Derivaciones · Trazabilidad
          </p>
        </div>

        <p className="text-white/30 text-xs">© 2026 Clínica El Castaño</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo mobile */}
          <div className="lg:hidden text-center space-y-2">
            <p className="text-white font-bold text-lg">Unidad de Cabeza y Cuello</p>
            <p className="text-white/50 text-sm">Clínica El Castaño</p>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="pb-4">
              <h1 className="text-xl font-bold text-slate-900">Iniciar sesión</h1>
              <p className="text-sm text-slate-500">Ingrese sus credenciales institucionales</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@clinicaelcastano.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/recuperar-password" className="text-xs hover:underline" style={{ color: 'var(--brand-red)' }}>
                      ¿Olvidó su contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ingresar al sistema
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
