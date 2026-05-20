import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <h2 className="text-xl font-semibold text-slate-700">Página no encontrada</h2>
      <p className="text-slate-500 text-sm">La sección que buscás no existe o está en construcción.</p>
      <Link href="/" className={buttonVariants({ variant: 'default' })}>
        <Home className="mr-2 h-4 w-4" />
        Volver al inicio
      </Link>
    </div>
  )
}
