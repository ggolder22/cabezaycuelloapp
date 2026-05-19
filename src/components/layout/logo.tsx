'use client'

import Image from 'next/image'
import { useState } from 'react'

export function Logo() {
  const [error, setError] = useState(false)

  return (
    <div className="flex items-center gap-3">
      {!error && (
        <Image
          src="/logo.png"
          alt="Clínica El Castaño"
          width={40}
          height={40}
          style={{ width: 40, height: 'auto' }}
          className="shrink-0"
          onError={() => setError(true)}
        />
      )}
      <div>
        <p className="text-white font-bold text-sm leading-tight">Unidad de</p>
        <p className="font-bold text-sm leading-tight" style={{ color: 'var(--brand-orange)' }}>
          Cabeza y Cuello
        </p>
        <p className="text-white/60 text-xs">Clínica El Castaño</p>
      </div>
    </div>
  )
}
