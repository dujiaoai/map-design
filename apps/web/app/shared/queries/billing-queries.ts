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
  ledger: (page: number, size: number) =>
    [...billingQueryKeys.all, 'ledger', page, size] as const,
  packages: () => [...billingQueryKeys.all, 'packages'] as const,
  teamUsage: (productCode?: string) =>
    [...billingQueryKeys.all, 'team-usage', productCode ?? 'all'] as const,
}

export const ledgerEntrySchema = z.object({
  id: z.string(),
  entryType: z.string(),
  amount: z.number(),
  balanceAfter: z.number(),
  productCode: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  createdAt: z.string(),
})

export const ledgerListResponseSchema = z.object({
  items: z.array(ledgerEntrySchema),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export type LedgerEntry = z.infer<typeof ledgerEntrySchema>
export type LedgerListResponse = z.infer<typeof ledgerListResponseSchema>

export const rechargePackageSchema = z.object({
  id: z.string(),
  code: z.string(),
  points: z.number(),
  priceCents: z.number(),
  currency: z.string(),
})

export const rechargePackageListResponseSchema = z.object({
  items: z.array(rechargePackageSchema),
})

export type RechargePackage = z.infer<typeof rechargePackageSchema>

export const teamUsageItemSchema = z.object({
  userId: z.string(),
  totalPoints: z.number(),
  eventCount: z.number(),
})

export const teamUsageSummarySchema = z.object({
  from: z.string(),
  to: z.string(),
  productCode: z.string().nullable().optional(),
  totalPoints: z.number(),
  items: z.array(teamUsageItemSchema),
})

export type TeamUsageItem = z.infer<typeof teamUsageItemSchema>
export type TeamUsageSummary = z.infer<typeof teamUsageSummarySchema>

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

function canReadLedger(): boolean {
  const session = auth.getSession()
  return hasPermission(session?.user.permissions, PermissionCodes.BILLING_LEDGER_READ)
}

function canRecharge(): boolean {
  const session = auth.getSession()
  return hasPermission(session?.user.permissions, PermissionCodes.BILLING_RECHARGE_CREATE)
}

function canReadTeamUsage(): boolean {
  const session = auth.getSession()
  return hasPermission(session?.user.permissions, PermissionCodes.BILLING_USAGE_READ)
}

export function ledgerQueryOptions(page = 0, size = 20) {
  return queryOptions({
    queryKey: billingQueryKeys.ledger(page, size),
    queryFn: async () =>
      ledgerListResponseSchema.parse(
        await billingApi.get<LedgerListResponse>(`/ledger?page=${page}&size=${size}`),
      ),
    staleTime: 30_000,
  })
}

export function packagesQueryOptions() {
  return queryOptions({
    queryKey: billingQueryKeys.packages(),
    queryFn: async () =>
      rechargePackageListResponseSchema.parse(
        await billingApi.get<{ items: RechargePackage[] }>('/packages'),
      ),
    staleTime: 60_000,
  })
}

export function teamUsageQueryOptions(productCode?: string) {
  const params = new URLSearchParams()
  if (productCode) params.set('productCode', productCode)
  const query = params.toString()

  return queryOptions({
    queryKey: billingQueryKeys.teamUsage(productCode),
    queryFn: async () =>
      teamUsageSummarySchema.parse(
        await billingApi.get<TeamUsageSummary>(`/team/usage${query ? `?${query}` : ''}`),
      ),
    staleTime: 60_000,
  })
}

export function useWalletQuery(enabled = true) {
  return useQuery({
    ...walletQueryOptions(),
    enabled: enabled && usesSaasSessionBootstrap() && canReadWallet(),
  })
}

export function useLedgerQuery(page = 0, size = 20, enabled = true) {
  return useQuery({
    ...ledgerQueryOptions(page, size),
    enabled: enabled && usesSaasSessionBootstrap() && canReadLedger(),
  })
}

export function useRechargePackagesQuery(enabled = true) {
  return useQuery({
    ...packagesQueryOptions(),
    enabled: enabled && usesSaasSessionBootstrap() && canRecharge(),
  })
}

export function useTeamUsageQuery(enabled = true, productCode?: string) {
  return useQuery({
    ...teamUsageQueryOptions(productCode),
    enabled: enabled && usesSaasSessionBootstrap() && canReadTeamUsage(),
  })
}
