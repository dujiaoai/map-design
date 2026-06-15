import { hasPermission, PermissionCodes } from '@repo/auth'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { billingClient } from '~/shared/api/billing-client'
import { auth } from '~/shared/auth/client'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export {
  estimateResponseSchema,
  ledgerEntrySchema,
  ledgerListResponseSchema,
  rechargeOrderResponseSchema,
  rechargePackageListResponseSchema,
  rechargePackageSchema,
  teamUsageItemSchema,
  teamUsageSummarySchema,
  walletResponseSchema,
  billingNotificationListSchema,
} from '@repo/billing-client'

export type {
  CreateRechargeOrderRequest,
  EstimateResponse,
  LedgerEntry,
  LedgerListResponse,
  RechargeOrderResponse,
  RechargePackage,
  TeamUsageItem,
  TeamUsageSummary,
  WalletResponse,
} from '@repo/billing-client'

export const billingQueryKeys = {
  all: ['billing'] as const,
  wallet: () => [...billingQueryKeys.all, 'wallet'] as const,
  ledger: (page: number, size: number) =>
    [...billingQueryKeys.all, 'ledger', page, size] as const,
  packages: () => [...billingQueryKeys.all, 'packages'] as const,
  teamUsage: (productCode?: string) =>
    [...billingQueryKeys.all, 'team-usage', productCode ?? 'all'] as const,
  estimate: (productCode: string, ruleCode: string, quantity: number) =>
    [...billingQueryKeys.all, 'estimate', productCode, ruleCode, quantity] as const,
  notifications: (page: number, size: number) =>
    [...billingQueryKeys.all, 'notifications', page, size] as const,
}

export function walletQueryOptions() {
  return queryOptions({
    queryKey: billingQueryKeys.wallet(),
    queryFn: () => billingClient.getWallet(),
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
    queryFn: () => billingClient.getLedger(page, size),
    staleTime: 30_000,
  })
}

export function packagesQueryOptions() {
  return queryOptions({
    queryKey: billingQueryKeys.packages(),
    queryFn: () => billingClient.listPackages(),
    staleTime: 60_000,
  })
}

export function teamUsageQueryOptions(productCode?: string) {
  return queryOptions({
    queryKey: billingQueryKeys.teamUsage(productCode),
    queryFn: () => billingClient.getTeamUsage(productCode),
    staleTime: 60_000,
  })
}

export function estimateQueryOptions(
  productCode: string,
  ruleCode: string,
  quantity: number,
) {
  return queryOptions({
    queryKey: billingQueryKeys.estimate(productCode, ruleCode, quantity),
    queryFn: () => billingClient.estimate(productCode, ruleCode, quantity),
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

export function useBillingEstimateQuery(
  productCode: string,
  ruleCode: string,
  quantity = 1,
  enabled = true,
) {
  return useQuery({
    ...estimateQueryOptions(productCode, ruleCode, quantity),
    enabled: enabled && usesSaasSessionBootstrap() && canReadWallet() && Boolean(ruleCode),
  })
}

export function notificationsQueryOptions(page = 0, size = 20) {
  return queryOptions({
    queryKey: billingQueryKeys.notifications(page, size),
    queryFn: () => billingClient.getNotifications(page, size),
    staleTime: 30_000,
  })
}

export function useBillingNotificationsQuery(page = 0, size = 20, enabled = true) {
  return useQuery({
    ...notificationsQueryOptions(page, size),
    enabled: enabled && usesSaasSessionBootstrap() && canReadWallet(),
    refetchInterval: 60_000,
  })
}
