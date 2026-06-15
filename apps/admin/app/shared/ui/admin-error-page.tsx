import type { ReactNode } from 'react'

export function AdminStandaloneShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <div className="admin-shell-grid" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function AdminLoadingPage({ message = '加载中…' }: { message?: string }) {
  return (
    <AdminStandaloneShell>
      <div className="admin-stagger flex flex-col items-center gap-3 text-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </AdminStandaloneShell>
  )
}

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
    <AdminStandaloneShell>
      <div className="admin-stagger flex max-w-md flex-col items-center gap-4 text-center">
        <p className="admin-display text-7xl font-semibold tracking-tight text-primary/75">
          {code}
        </p>
        <h1 className="text-xl font-medium">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">{actions}</div>
      </div>
    </AdminStandaloneShell>
  )
}
