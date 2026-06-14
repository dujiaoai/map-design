import { createApiClient, type ApiClientOptions } from '@repo/api-client'

import {
  estimateResponseSchema,
  ledgerListResponseSchema,
  rechargeOrderResponseSchema,
  rechargePackageListResponseSchema,
  teamUsageSummarySchema,
  walletResponseSchema,
  type CreateRechargeOrderRequest,
  type EstimateResponse,
  type LedgerListResponse,
  type RechargeOrderResponse,
  type RechargePackage,
  type TeamUsageSummary,
  type WalletResponse,
} from './schemas'

export type BillingClientOptions = ApiClientOptions

export type BillingClient = ReturnType<typeof createBillingClient>

export function createBillingClient(options: BillingClientOptions) {
  const api = createApiClient(options)

  return {
    api,

    async getWallet(): Promise<WalletResponse> {
      return walletResponseSchema.parse(await api.get('/wallet'))
    },

    async getLedger(page = 0, size = 20): Promise<LedgerListResponse> {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      })
      return ledgerListResponseSchema.parse(await api.get(`/ledger?${params.toString()}`))
    },

    async listPackages(): Promise<{ items: RechargePackage[] }> {
      return rechargePackageListResponseSchema.parse(await api.get('/packages'))
    },

    async getTeamUsage(productCode?: string): Promise<TeamUsageSummary> {
      const params = new URLSearchParams()
      if (productCode) params.set('productCode', productCode)
      const query = params.toString()
      return teamUsageSummarySchema.parse(
        await api.get(`/team/usage${query ? `?${query}` : ''}`),
      )
    },

    async estimate(
      productCode: string,
      ruleCode: string,
      quantity: number,
    ): Promise<EstimateResponse> {
      const params = new URLSearchParams({
        productCode,
        ruleCode,
        quantity: String(quantity),
      })
      return estimateResponseSchema.parse(await api.get(`/estimate?${params.toString()}`))
    },

    async createRechargeOrder(
      input: CreateRechargeOrderRequest,
    ): Promise<RechargeOrderResponse> {
      return rechargeOrderResponseSchema.parse(
        await api.post('/recharge-orders', {
          packageCode: input.packageCode,
          channel: input.channel ?? 'mock',
        }),
      )
    },

    async mockPayRechargeOrder(orderNo: string): Promise<RechargeOrderResponse> {
      return rechargeOrderResponseSchema.parse(
        await api.post(`/recharge-orders/${encodeURIComponent(orderNo)}/mock-pay`),
      )
    },

    async cancelRechargeOrder(orderNo: string): Promise<RechargeOrderResponse> {
      return rechargeOrderResponseSchema.parse(
        await api.post(`/recharge-orders/${encodeURIComponent(orderNo)}/cancel`),
      )
    },
  }
}
