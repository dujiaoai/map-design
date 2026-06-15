import type { ReactNode } from 'react'

export function AdminErrorPage({
  code,
  title,
  description,
  actions,
}: {
  code: string
  title: string
  description: string
  actions: ReactNode
}) {
  return (
    <main className="admin-shell relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 text-center text-foreground">
      <div className="admin-shell-grid" aria-hidden="true" />
      <div className="admin-stagger relative z-10 flex max-w-md flex-col items-center gap-4">
        <p className="admin-display text-7xl font-semibold tracking-tight text-primary/75">
          {code}
        </p>
        <h1 className="text-xl font-medium">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="pt-2">{actions}</div>
      </div>
    </main>
  )
}
