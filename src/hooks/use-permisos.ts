'use client'

import { useAuthStore } from '@/stores/auth.store'
import { tienePermiso, type Modulo } from '@/config/roles'

export function usePermisos() {
  const { usuario } = useAuthStore()

  const puede = (modulo: Modulo, accion: string): boolean => {
    if (!usuario) return false
    return tienePermiso(usuario.rol, modulo, accion)
  }

  const esAdmin = usuario?.rol === 'admin'

  return { puede, esAdmin, rol: usuario?.rol }
}
