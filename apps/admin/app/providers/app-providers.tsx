import { SessionProvider } from '@repo/auth'
import { Toaster, TooltipProvider } from '@repo/ui'
import { QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from '~/features/theme'
import { AdminAntProvider } from '~/shared/ant'
import { auth } from '~/shared/auth/client'
import { queryClient } from '~/shared/lib/query-client'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider auth={auth}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AdminAntProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors closeButton />
            </TooltipProvider>
          </AdminAntProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
