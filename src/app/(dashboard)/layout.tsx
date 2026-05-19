export const dynamic = 'force-dynamic'

import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Header } from '@/components/layout/header'
import { Logo } from '@/components/layout/logo'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col" style={{ background: 'var(--sidebar)' }}>
        <div className="px-5 py-4 border-b border-white/10">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
