'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import { obtenerPerfilActual } from '@/app/(dashboard)/perfil/actions'

export function useAuth() {
  const { usuario, loading, setUsuario, setLoading } = useAuthStore()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let activo = true

    // Si ya tenemos el usuario en el store, no volver a buscar
    if (usuario !== null) {
      setLoading(false)
      return
    }

    obtenerPerfilActual().then((perfil) => {
      if (!activo) return
      setUsuario(perfil)
      setLoading(false)
    }).catch(() => {
      if (activo) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (!activo) return
      if (event === 'SIGNED_OUT') {
        setUsuario(null)
        setLoading(false)
        return
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const perfil = await obtenerPerfilActual()
        if (activo) {
          setUsuario(perfil)
          setLoading(false)
        }
      }
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
