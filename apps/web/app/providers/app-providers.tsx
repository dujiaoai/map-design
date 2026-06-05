import { SessionProvider, TenantProvider } from '@repo/auth'
import { TooltipProvider } from '@repo/ui'
import { QueryClientProvider } from '@tanstack/react-query'

import { auth } from '~/shared/auth/client'
import { queryClient } from '~/shared/lib/query-client'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider auth={auth}>
      <TenantProvider auth={auth}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryClientProvider>
      </TenantProvider>
    </SessionProvider>
  )
}
