'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import type { Usuario } from '@/types'

export function useAuth() {
  const { usuario, loading, setUsuario, setLoading } = useAuthStore()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUsuario(perfil as Usuario)
      } else {
        setUsuario(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { usuario, loading, signOut }
}
