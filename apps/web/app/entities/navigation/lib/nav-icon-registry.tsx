import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import * as LucideIcons from 'lucide-react'

export function resolveNavIcon(iconKey: string): ReactNode {
  const componentName = iconKey.endsWith('Icon') ? iconKey : `${iconKey}Icon`
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[componentName]
  if (!Icon) {
    return null
  }
  return <Icon />
}
