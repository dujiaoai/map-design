import { SessionProvider, TenantProvider } from '@repo/auth'
import { Toaster, TooltipProvider } from '@repo/ui'
import { QueryClientProvider } from '@tanstack/react-query'

import { InsufficientBalanceProvider } from '~/features/billing/model/insufficient-balance-provider'
import { ThemeProvider } from '~/features/theme'
import { auth } from '~/shared/auth/client'
import { queryClient } from '~/shared/lib/query-client'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider auth={auth}>
      <TenantProvider auth={auth}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <InsufficientBalanceProvider>
                {children}
                <Toaster richColors closeButton />
              </InsufficientBalanceProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </TenantProvider>
    </SessionProvider>
  )
}
