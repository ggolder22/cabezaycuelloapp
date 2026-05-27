'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { usePermisos } from '@/hooks/use-permisos'
import {
  Users, Calendar, FileText, ImageIcon,
  LayoutDashboard, Shield,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, modulo: null, accion: null },
  { label: 'Pacientes', href: '/pacientes', icon: Users, modulo: 'pacientes' as const, accion: 'ver' },
  { label: 'Historia Clínica', href: '/historia-clinica', icon: FileText, modulo: 'historia_clinica' as const, accion: 'ver' },
  { label: 'Agenda', href: '/agenda', icon: Calendar, modulo: 'agenda' as const, accion: 'ver' },
  { label: 'Imágenes', href: '/imagenes', icon: ImageIcon, modulo: 'imagenes' as const, accion: 'ver' },
  { label: 'Administración', href: '/admin', icon: Shield, modulo: 'admin' as const, accion: 'ver' },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { puede } = usePermisos()

  const visibles = navItems.filter(item => !item.modulo || puede(item.modulo, item.accion!))

  return (
    <nav className="space-y-0.5 px-3">
      {visibles.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            style={active ? { background: 'var(--brand-red)' } : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
