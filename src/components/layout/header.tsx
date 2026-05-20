'use client'

import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/auth.store'
import { ROLES } from '@/config/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, ChevronDown, Menu } from 'lucide-react'
import { useState } from 'react'
import { Logo } from './logo'
import { SidebarNav } from './sidebar-nav'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function Header() {
  const { signOut } = useAuth()
  const { usuario } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const iniciales = usuario
    ? `${usuario.primer_nombre?.[0] ?? ''}${usuario.primer_apellido?.[0] ?? ''}`.toUpperCase()
    : '?'

  const rolInfo = usuario ? ROLES[usuario.rol] : null
  const nombreCompleto = usuario
    ? `${usuario.primer_nombre} ${usuario.primer_apellido}`
    : ''

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Drawer mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--sidebar)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Logo />
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
      </div>

    <header className="border-b bg-white px-4 lg:px-6 py-3 flex items-center justify-between">
      {/* Hamburger mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50 cursor-pointer outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-white text-xs font-bold" style={{ background: 'var(--brand-red)' }}>
              {iniciales}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{nombreCompleto}</p>
            {rolInfo && <p className="text-xs text-slate-500">{rolInfo.especialidad}</p>}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <div className="px-3 py-2.5 mb-1">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{nombreCompleto}</p>
            {rolInfo && <p className="text-xs text-slate-500 mt-0.5">{rolInfo.label}</p>}
            {usuario?.numero_matricula
              ? <p className="text-xs text-slate-400 mt-0.5">Mat. {usuario.numero_matricula}</p>
              : <p className="text-xs text-slate-400 mt-0.5 italic">Sin matrícula cargada</p>
            }
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => router.push('/perfil')}>
            <User className="mr-2 h-4 w-4" />
            Mi perfil
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={signOut}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  </>
  )
}
