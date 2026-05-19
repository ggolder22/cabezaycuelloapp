'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from './logo'
import { SidebarNav } from './sidebar-nav'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Cierra el drawer al navegar
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      {/* Botón hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--sidebar)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
      </div>
    </>
  )
}
