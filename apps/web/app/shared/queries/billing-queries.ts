import { hasPermission, PermissionCodes } from '@repo/auth'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { billingApi } from '~/shared/api/billing-client'
import { auth } from '~/shared/auth/client'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export const walletResponseSchema = z.object({
  walletId: z.string(),
  balance: z.number(),
  frozenBalance: z.number(),
  availableBalance: z.number(),
})

export type WalletResponse = z.infer<typeof walletResponseSchema>

export const billingQueryKeys = {
  all: ['billing'] as const,
  wallet: () => [...billingQueryKeys.all, 'wallet'] as const,
}

export function walletQueryOptions() {
  return queryOptions({
    queryKey: billingQueryKeys.wallet(),
    queryFn: async () => walletResponseSchema.parse(await billingApi.get<WalletResponse>('/wallet')),
    staleTime: 30_000,
  })
}

function canReadWallet(): boolean {
  const session = auth.getSession()
  return hasPermission(session?.user.permissions, PermissionCodes.BILLING_WALLET_READ)
}

export function useWalletQuery(enabled = true) {
  return useQuery({
    ...walletQueryOptions(),
    enabled: enabled && usesSaasSessionBootstrap() && canReadWallet(),
  })
}
