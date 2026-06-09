import { useState } from 'react'

import { MapIcon } from 'lucide-react'

export function TenantLogo() {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return (
      <div className="bg-brand-gradient flex size-full items-center justify-center rounded-md">
        <MapIcon className="size-4 text-primary-foreground" aria-hidden />
      </div>
    )
  }

  return (
    <img
      src="/avatars/logo.png"
      alt=""
      className="size-full object-contain"
      onError={() => setUseFallback(true)}
    />
  )
}
