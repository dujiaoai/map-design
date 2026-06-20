import { ShieldCheckIcon } from 'lucide-react'

import { adminBrand } from '~/shared/config/admin-brand'

export function AdminBrandLogo() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden rounded-md border border-primary/35 bg-brand-gradient shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_28%,transparent)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary-foreground)_18%,transparent),transparent_55%)]"
        aria-hidden
      />
      <ShieldCheckIcon className="relative size-4 text-primary-foreground" aria-hidden />
    </div>
  )
}
