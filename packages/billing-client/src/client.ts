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
  type TransferRequest,
  type TransferResponse,
  type WalletResponse,
  transferResponseSchema,
  billingNotificationListSchema,
  billingNotificationMarkAllReadSchema,
  invoiceListResponseSchema,
  invoiceRequestSchema,
  redeemCouponResponseSchema,
  wireTransferListResponseSchema,
  wireTransferRequestSchema,
  type CreateWireTransferRequest,
  type RedeemCouponResponse,
  type WireTransferListResponse,
  type WireTransferRequest,
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
          ...(input.couponCode ? { couponCode: input.couponCode } : {}),
          ...(input.payScene ? { payScene: input.payScene } : {}),
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

    async transfer(input: TransferRequest): Promise<TransferResponse> {
      return transferResponseSchema.parse(await api.post('/transfer', input))
    },

    async getNotifications(page = 0, size = 20) {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      })
      return billingNotificationListSchema.parse(
        await api.get(`/notifications?${params.toString()}`),
      )
    },

    async markNotificationRead(notificationId: string) {
      await api.post(`/notifications/${encodeURIComponent(notificationId)}/read`)
    },

    async markAllNotificationsRead() {
      return billingNotificationMarkAllReadSchema.parse(await api.post('/notifications/read-all'))
    },

    async createInvoiceRequest(input: CreateInvoiceRequest): Promise<InvoiceRequest> {
      return invoiceRequestSchema.parse(await api.post('/invoices', input))
    },

    async listInvoices(page = 0, size = 20): Promise<InvoiceListResponse> {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      })
      return invoiceListResponseSchema.parse(await api.get(`/invoices?${params.toString()}`))
    },

    async redeemCoupon(code: string): Promise<RedeemCouponResponse> {
      return redeemCouponResponseSchema.parse(
        await api.post('/coupons/redeem', { code: code.trim() }),
      )
    },

    async createWireTransferRequest(input: CreateWireTransferRequest): Promise<WireTransferRequest> {
      return wireTransferRequestSchema.parse(await api.post('/wire-transfers', input))
    },

    async listWireTransfers(page = 0, size = 20): Promise<WireTransferListResponse> {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      })
      return wireTransferListResponseSchema.parse(
        await api.get(`/wire-transfers?${params.toString()}`),
      )
    },
  }
}
