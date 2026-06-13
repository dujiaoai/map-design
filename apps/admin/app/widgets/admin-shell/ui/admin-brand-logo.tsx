import { ShieldCheckIcon } from 'lucide-react'

export function AdminBrandLogo() {
  return (
    <div className="bg-brand-gradient flex size-full items-center justify-center rounded-md">
      <ShieldCheckIcon className="size-4 text-primary-foreground" aria-hidden />
    </div>
  )
}
