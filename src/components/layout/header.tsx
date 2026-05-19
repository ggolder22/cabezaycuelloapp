'use client'

import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/auth.store'
import { ROLES } from '@/config/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, ChevronDown } from 'lucide-react'

export function Header() {
  const { signOut } = useAuth()
  const { usuario } = useAuthStore()

  const iniciales = usuario
    ? `${usuario.primer_nombre?.[0] ?? ''}${usuario.primer_apellido?.[0] ?? ''}`.toUpperCase()
    : '??'

  const rolInfo = usuario ? ROLES[usuario.rol] : null

  return (
    <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50 cursor-pointer outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-white text-xs font-bold" style={{ background: 'var(--brand-red)' }}>
              {iniciales}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">
              {usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido}` : '...'}
            </p>
            {rolInfo && (
              <p className="text-xs text-slate-500">{rolInfo.especialidad}</p>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div>
              <p className="font-semibold">{usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido}` : ''}</p>
              {rolInfo && <p className="text-xs font-normal text-slate-500">{rolInfo.label}</p>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
