'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import type { Usuario } from '@/types'

async function cargarPerfil(supabase: ReturnType<typeof createClient>, userId: string): Promise<Usuario | null> {
  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()
  return data as Usuario | null
}

export function useAuth() {
  const { usuario, loading, setUsuario, setLoading } = useAuthStore()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let activo = true

    // Carga inmediata al montar — no esperar al evento
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!activo) return
      if (session?.user) {
        const perfil = await cargarPerfil(supabase, session.user.id)
        if (activo) setUsuario(perfil)
      }
      if (activo) setLoading(false)
    })

    // Escuchar cambios posteriores (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!activo) return
      if (session?.user) {
        const perfil = await cargarPerfil(supabase, session.user.id)
        if (activo) setUsuario(perfil)
      } else {
        if (activo) setUsuario(null)
      }
      if (activo) setLoading(false)
    })

    return () => {
      activo = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      setUsuario(null)
      router.push('/login')
    }
  }

  return { usuario, loading, signOut }
}
