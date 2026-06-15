#!/usr/bin/env node
/**
 * Billing API 端到端冒烟（直连 :8083/v1/billing + :8082/v1/auth 登录）。
 *
 * 覆盖：membership 内网 API 探活、充值/mock-pay、充值抵扣券、钱包与流水、发票申请与开票、
 * 优惠券兑换、对公转账审核入账、微信 OAuth config 探活。
 *
 * Usage:
 *   node services/billing-api/scripts/smoke-billing.mjs
 *   BILLING_API_BASE_URL=http://localhost:8083/v1 SAAS_API_BASE_URL=http://localhost:8082/v1 node services/billing-api/scripts/smoke-billing.mjs
 *
 * Webhook 验签（与 billing.webhook.signature-verify-enabled 对齐）：
 *   BILLING_WEBHOOK_SIGNATURE_MODE=off|hmac|wechat_v3|alipay_rsa  （默认 off，仅 Token）
 *   BILLING_WEBHOOK_HMAC_SECRET=...                               （hmac 模式）
 *   BILLING_WEBHOOK_WECHAT_PRIVATE_KEY_PEM=...                    （wechat_v3 签名）
 *   BILLING_WEBHOOK_ALIPAY_PRIVATE_KEY_PEM=...                    （alipay_rsa 签名）
 */

import crypto from 'node:crypto'

const billingBase = (process.env.BILLING_API_BASE_URL ?? 'http://localhost:8083/v1/billing').replace(
  /\/$/,
  '',
)
const adminBillingBase = (
  process.env.BILLING_ADMIN_BASE_URL ??
  billingBase.replace(/\/billing$/, '/admin/billing')
).replace(/\/$/, '')
const saasBase = (process.env.SAAS_API_BASE_URL ?? 'http://localhost:8082/v1').replace(/\/$/, '')
const saasOrigin = saasBase.replace(/\/v1$/, '')

const internalToken =
  process.env.BILLING_INTERNAL_TOKEN ?? 'dev-billing-internal-token-change-me'

const credentials = {
  email: process.env.SMOKE_EMAIL ?? 'admin@demo.local',
  password: process.env.SMOKE_PASSWORD ?? 'password',
  tenantId: process.env.SMOKE_TENANT ?? 'demo',
}

const webhookToken =
  process.env.BILLING_WEBHOOK_TOKEN ?? 'dev-billing-webhook-token-change-me'

const webhookSignatureMode = (process.env.BILLING_WEBHOOK_SIGNATURE_MODE ?? 'off')
  .trim()
  .toLowerCase()
const webhookHmacSecret = process.env.BILLING_WEBHOOK_HMAC_SECRET ?? ''
const wechatPrivateKeyPem = process.env.BILLING_WEBHOOK_WECHAT_PRIVATE_KEY_PEM ?? ''
const alipayPrivateKeyPem = process.env.BILLING_WEBHOOK_ALIPAY_PRIVATE_KEY_PEM ?? ''

const passed = []

function fail(step, detail) {
  console.error(`FAIL [${step}] ${detail}`)
  process.exit(1)
}

function signHmacSha256Hex(secret, message) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex')
}

function signRsaSha256Base64(privateKeyPem, message) {
  const key = crypto.createPrivateKey(privateKeyPem)
  return crypto.sign('RSA-SHA256', Buffer.from(message), key).toString('base64')
}

function buildWebhookHeaders(channel, rawBody) {
  const headers = { 'X-Billing-Webhook-Token': webhookToken }

  if (webhookSignatureMode === 'off' || webhookSignatureMode === '') {
    return headers
  }

  if (webhookSignatureMode === 'hmac') {
    if (!webhookHmacSecret) {
      fail('webhook-config', 'BILLING_WEBHOOK_HMAC_SECRET is required when mode=hmac')
    }
    headers['X-Billing-Webhook-Signature'] = signHmacSha256Hex(webhookHmacSecret, rawBody)
    return headers
  }

  if (webhookSignatureMode === 'wechat_v3') {
    if (channel !== 'wechat') {
      fail('webhook-config', 'wechat_v3 mode requires SMOKE_RECHARGE_CHANNEL=wechat')
    }
    if (!wechatPrivateKeyPem) {
      fail('webhook-config', 'BILLING_WEBHOOK_WECHAT_PRIVATE_KEY_PEM is required when mode=wechat_v3')
    }
    const timestamp = String(Math.floor(Date.now() / 1000))
    const nonce = `smoke-${Date.now()}`
    const message = `${timestamp}\n${nonce}\n${rawBody}\n`
    headers['Wechatpay-Timestamp'] = timestamp
    headers['Wechatpay-Nonce'] = nonce
    headers['Wechatpay-Signature'] = signRsaSha256Base64(wechatPrivateKeyPem, message)
    return headers
  }

  if (webhookSignatureMode === 'alipay_rsa') {
    if (channel !== 'alipay') {
      fail('webhook-config', 'alipay_rsa mode requires SMOKE_RECHARGE_CHANNEL=alipay')
    }
    if (!alipayPrivateKeyPem) {
      fail('webhook-config', 'BILLING_WEBHOOK_ALIPAY_PRIVATE_KEY_PEM is required when mode=alipay_rsa')
    }
    headers['Alipay-Signature'] = signRsaSha256Base64(alipayPrivateKeyPem, rawBody)
    return headers
  }

  fail('webhook-config', `Unknown BILLING_WEBHOOK_SIGNATURE_MODE: ${webhookSignatureMode}`)
}

async function api(url, { method = 'GET', headers = {}, body, rawBody } = {}) {
  const payload = rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined)
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: payload,
  })
  const text = await response.text()
  let parsed = null
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
  }
  return { ok: response.ok, status: response.status, body: parsed }
}

async function postPaymentWebhook(channel, payload) {
  const rawBody = JSON.stringify(payload)
  const path = channel === 'alipay' ? 'alipay' : 'wechat'
  return api(`${billingBase}/webhooks/${path}`, {
    method: 'POST',
    headers: buildWebhookHeaders(channel, rawBody),
    rawBody,
  })
}

async function main() {
  const login = await api(`${saasBase}/auth/login`, {
    method: 'POST',
    body: credentials,
  })
  if (!login.ok || !login.body?.accessToken) {
    fail('login', `HTTP ${login.status} ${JSON.stringify(login.body)}`)
  }
  passed.push('login')

  const token = login.body.accessToken
  const auth = { Authorization: `Bearer ${token}` }
  const internalAuth = { 'X-Billing-Internal-Token': internalToken }

  const session = await api(`${saasBase}/users/me`, { headers: auth })
  if (!session.ok || !session.body?.user?.id || !session.body?.tenant?.id) {
    fail('users-me', `HTTP ${session.status} ${JSON.stringify(session.body)}`)
  }
  passed.push('users-me')

  const tenantUuid = session.body.tenant.id
  const userUuid = session.body.user.id

  const membershipCheck = await api(
    `${saasOrigin}/internal/v1/membership/tenants/${encodeURIComponent(tenantUuid)}/users/${encodeURIComponent(userUuid)}`,
    { headers: internalAuth },
  )
  if (!membershipCheck.ok || membershipCheck.body?.member !== true) {
    fail('membership-check', `HTTP ${membershipCheck.status} ${JSON.stringify(membershipCheck.body)}`)
  }
  passed.push('membership-check')

  const syncEvents = await api(`${saasOrigin}/internal/v1/membership/sync-events?limit=10`, {
    headers: internalAuth,
  })
  if (!syncEvents.ok || !Array.isArray(syncEvents.body?.items)) {
    fail('membership-sync-events', `HTTP ${syncEvents.status} ${JSON.stringify(syncEvents.body)}`)
  }
  passed.push('membership-sync-events')

  const walletBefore = await api(`${billingBase}/wallet`, { headers: auth })
  if (!walletBefore.ok) {
    fail('wallet', `HTTP ${walletBefore.status} ${JSON.stringify(walletBefore.body)}`)
  }
  const balanceBefore = walletBefore.body?.balance ?? 0
  passed.push('wallet')

  const packages = await api(`${billingBase}/packages`, { headers: auth })
  if (!packages.ok || !Array.isArray(packages.body?.items) || packages.body.items.length === 0) {
    fail('packages', `HTTP ${packages.status} ${JSON.stringify(packages.body)}`)
  }
  passed.push('packages')

  const oauthConfig = await api(`${billingBase}/wechat/oauth/config`, { headers: auth })
  if (
    !oauthConfig.ok ||
    typeof oauthConfig.body?.appId !== 'string' ||
    typeof oauthConfig.body?.enabled !== 'boolean'
  ) {
    fail('wechat-oauth-config', `HTTP ${oauthConfig.status} ${JSON.stringify(oauthConfig.body)}`)
  }
  passed.push('wechat-oauth-config')

  const platformAccount = await api(`${billingBase}/wire-transfers/platform-account`, {
    headers: auth,
  })
  if (
    !platformAccount.ok ||
    typeof platformAccount.body?.enabled !== 'boolean' ||
    typeof platformAccount.body?.accountName !== 'string'
  ) {
    fail(
      'wire-transfer-platform-account',
      `HTTP ${platformAccount.status} ${JSON.stringify(platformAccount.body)}`,
    )
  }
  passed.push('wire-transfer-platform-account')

  const packageCode = packages.body.items[0].code
  const channel = process.env.SMOKE_RECHARGE_CHANNEL ?? 'mock'

  const order = await api(`${billingBase}/recharge-orders`, {
    method: 'POST',
    headers: auth,
    body: { packageCode, channel },
  })
  if (!order.ok || !order.body?.orderNo) {
    fail('recharge-create', `HTTP ${order.status} ${JSON.stringify(order.body)}`)
  }
  passed.push('recharge-create')

  const orderNo = order.body.orderNo
  const priceCents = order.body.priceCents ?? packages.body.items[0].priceCents

  if (channel === 'mock') {
    const mockPay = await api(`${billingBase}/recharge-orders/${encodeURIComponent(orderNo)}/mock-pay`, {
      method: 'POST',
      headers: auth,
    })
    if (!mockPay.ok || mockPay.body?.status !== 'paid') {
      fail('mock-pay', `HTTP ${mockPay.status} ${JSON.stringify(mockPay.body)}`)
    }
    passed.push('mock-pay')
  } else if (channel === 'wechat' || channel === 'alipay') {
    const webhook = await postPaymentWebhook(channel, {
      orderNo,
      providerTradeNo: `smoke-${Date.now()}`,
      success: true,
      priceCents,
    })
    if (!webhook.ok) {
      fail(`webhook-${channel}`, `HTTP ${webhook.status} ${JSON.stringify(webhook.body)}`)
    }
    passed.push(`webhook-${channel}`)
  } else {
    fail('recharge-channel', `Unsupported SMOKE_RECHARGE_CHANNEL: ${channel}`)
  }

  const walletAfter = await api(`${billingBase}/wallet`, { headers: auth })
  if (!walletAfter.ok) {
    fail('wallet-after', `HTTP ${walletAfter.status}`)
  }
  const balanceAfter = walletAfter.body?.balance ?? 0
  const expectedDelta = order.body.points ?? packages.body.items[0].points ?? 0
  if (balanceAfter < balanceBefore + expectedDelta) {
    fail(
      'wallet-balance',
      `expected >= ${balanceBefore + expectedDelta}, got ${balanceAfter}`,
    )
  }
  passed.push('wallet-balance')

  const ledger = await api(`${billingBase}/ledger`, { headers: auth })
  if (!ledger.ok || !Array.isArray(ledger.body?.items)) {
    fail('ledger', `HTTP ${ledger.status} ${JSON.stringify(ledger.body)}`)
  }
  passed.push('ledger')

  // --- F-4 发票申请 + Admin 开票 ---
  const invoiceCreate = await api(`${billingBase}/invoices`, {
    method: 'POST',
    headers: auth,
    body: {
      orderNo,
      invoiceType: 'personal',
      title: 'Smoke Test',
      email: credentials.email,
    },
  })
  if (!invoiceCreate.ok || invoiceCreate.body?.status !== 'pending') {
    fail('invoice-create', `HTTP ${invoiceCreate.status} ${JSON.stringify(invoiceCreate.body)}`)
  }
  passed.push('invoice-create')

  const invoiceList = await api(`${billingBase}/invoices`, { headers: auth })
  if (!invoiceList.ok || !Array.isArray(invoiceList.body?.items)) {
    fail('invoice-list', `HTTP ${invoiceList.status} ${JSON.stringify(invoiceList.body)}`)
  }
  const userInvoice =
    invoiceList.body.items.find((item) => item.orderNo === orderNo) ?? invoiceList.body.items[0]
  if (!userInvoice?.id) {
    fail('invoice-list', 'no invoice for paid order')
  }
  passed.push('invoice-list')

  const adminInvoices = await api(`${adminBillingBase}/invoices?status=pending`, { headers: auth })
  if (!adminInvoices.ok || !Array.isArray(adminInvoices.body?.items)) {
    fail('admin-invoice-list', `HTTP ${adminInvoices.status} ${JSON.stringify(adminInvoices.body)}`)
  }
  const pendingInvoice =
    adminInvoices.body.items.find((item) => item.orderNo === orderNo) ??
    adminInvoices.body.items.find((item) => item.id === userInvoice.id)
  if (!pendingInvoice?.id) {
    fail('admin-invoice-list', `no pending invoice for order ${orderNo}`)
  }
  passed.push('admin-invoice-list')

  const issuePdfUrl = `https://smoke.example/invoices/${pendingInvoice.id}.pdf`
  const invoiceIssue = await api(
    `${adminBillingBase}/invoices/${encodeURIComponent(pendingInvoice.id)}/issue`,
    {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfUrl: issuePdfUrl }),
    },
  )
  if (
    !invoiceIssue.ok ||
    invoiceIssue.body?.status !== 'issued' ||
    invoiceIssue.body?.pdfUrl !== issuePdfUrl
  ) {
    fail('invoice-issue', `HTTP ${invoiceIssue.status} ${JSON.stringify(invoiceIssue.body)}`)
  }
  passed.push('invoice-issue')

  // --- F-5 优惠券创建 + 兑换 ---
  const couponCode = `SMOKE${Date.now()}`
  const couponPoints = 50
  const couponCreate = await api(`${adminBillingBase}/coupons`, {
    method: 'POST',
    headers: auth,
    body: {
      code: couponCode,
      points: couponPoints,
      maxTotalRedemptions: 5,
      status: 'active',
    },
  })
  if (!couponCreate.ok || couponCreate.body?.code !== couponCode.toUpperCase()) {
    fail('coupon-create', `HTTP ${couponCreate.status} ${JSON.stringify(couponCreate.body)}`)
  }
  passed.push('coupon-create')

  const walletBeforeCoupon = await api(`${billingBase}/wallet`, { headers: auth })
  if (!walletBeforeCoupon.ok) {
    fail('wallet-before-coupon', `HTTP ${walletBeforeCoupon.status}`)
  }
  const balanceBeforeCoupon = walletBeforeCoupon.body?.balance ?? 0

  const couponRedeem = await api(`${billingBase}/coupons/redeem`, {
    method: 'POST',
    headers: auth,
    body: { code: couponCode },
  })
  if (
    !couponRedeem.ok ||
    couponRedeem.body?.points !== couponPoints ||
    couponRedeem.body?.idempotentReplay !== false
  ) {
    fail('coupon-redeem', `HTTP ${couponRedeem.status} ${JSON.stringify(couponRedeem.body)}`)
  }
  if ((couponRedeem.body?.walletBalance ?? 0) < balanceBeforeCoupon + couponPoints) {
    fail(
      'coupon-redeem-balance',
      `expected >= ${balanceBeforeCoupon + couponPoints}, got ${couponRedeem.body?.walletBalance}`,
    )
  }
  passed.push('coupon-redeem')

  // --- F-5+ 充值抵扣券 ---
  const discountCouponCode = `DSCT${Date.now()}`
  const discountCents = 500
  const discountCouponCreate = await api(`${adminBillingBase}/coupons`, {
    method: 'POST',
    headers: auth,
    body: {
      code: discountCouponCode,
      kind: 'discount',
      discountCents,
      points: 1,
      maxTotalRedemptions: 5,
      status: 'active',
    },
  })
  if (!discountCouponCreate.ok || discountCouponCreate.body?.kind !== 'discount') {
    fail(
      'discount-coupon-create',
      `HTTP ${discountCouponCreate.status} ${JSON.stringify(discountCouponCreate.body)}`,
    )
  }
  passed.push('discount-coupon-create')

  const listPriceCents =
    packages.body.items[0].priceCents ?? order.body.listPriceCents ?? priceCents
  const discountOrder = await api(`${billingBase}/recharge-orders`, {
    method: 'POST',
    headers: auth,
    body: { packageCode, channel, couponCode: discountCouponCode },
  })
  if (!discountOrder.ok || !discountOrder.body?.orderNo) {
    fail('recharge-discount-create', `HTTP ${discountOrder.status} ${JSON.stringify(discountOrder.body)}`)
  }
  const expectedPayable = Math.max(listPriceCents - discountCents, 0)
  if (
    discountOrder.body.listPriceCents !== listPriceCents ||
    discountOrder.body.couponDiscountCents !== Math.min(discountCents, listPriceCents) ||
    discountOrder.body.priceCents !== expectedPayable
  ) {
    fail(
      'recharge-discount-create',
      `unexpected pricing list=${discountOrder.body.listPriceCents} discount=${discountOrder.body.couponDiscountCents} payable=${discountOrder.body.priceCents}`,
    )
  }
  passed.push('recharge-discount-create')

  const discountOrderNo = discountOrder.body.orderNo
  const discountPayableCents = discountOrder.body.priceCents

  if (channel === 'mock') {
    const discountMockPay = await api(
      `${billingBase}/recharge-orders/${encodeURIComponent(discountOrderNo)}/mock-pay`,
      { method: 'POST', headers: auth },
    )
    if (!discountMockPay.ok || discountMockPay.body?.status !== 'paid') {
      fail('recharge-discount-mock-pay', `HTTP ${discountMockPay.status} ${JSON.stringify(discountMockPay.body)}`)
    }
    passed.push('recharge-discount-mock-pay')
  } else if (channel === 'wechat' || channel === 'alipay') {
    const discountWebhook = await postPaymentWebhook(channel, {
      orderNo: discountOrderNo,
      providerTradeNo: `smoke-discount-${Date.now()}`,
      success: true,
      priceCents: discountPayableCents,
    })
    if (!discountWebhook.ok) {
      fail(
        `recharge-discount-webhook-${channel}`,
        `HTTP ${discountWebhook.status} ${JSON.stringify(discountWebhook.body)}`,
      )
    }
    passed.push(`recharge-discount-webhook-${channel}`)
  }

  // --- F-6 对公转账申请 + Admin 审核入账 ---
  const wirePoints = 100
  const wireCreate = await api(`${billingBase}/wire-transfers`, {
    method: 'POST',
    headers: auth,
    body: {
      companyName: 'Smoke Test Co.',
      contactEmail: credentials.email,
      amountCents: wirePoints * 10,
      points: wirePoints,
      bankReference: `smoke-${Date.now()}`,
    },
  })
  if (!wireCreate.ok || wireCreate.body?.status !== 'pending') {
    fail('wire-transfer-create', `HTTP ${wireCreate.status} ${JSON.stringify(wireCreate.body)}`)
  }
  const wireRequestId = wireCreate.body?.id
  if (!wireRequestId) {
    fail('wire-transfer-create', 'missing request id')
  }
  passed.push('wire-transfer-create')

  const wireList = await api(`${billingBase}/wire-transfers`, { headers: auth })
  if (!wireList.ok || !Array.isArray(wireList.body?.items)) {
    fail('wire-transfer-list', `HTTP ${wireList.status} ${JSON.stringify(wireList.body)}`)
  }
  passed.push('wire-transfer-list')

  const walletBeforeWire = await api(`${billingBase}/wallet`, { headers: auth })
  if (!walletBeforeWire.ok) {
    fail('wallet-before-wire', `HTTP ${walletBeforeWire.status}`)
  }
  const balanceBeforeWire = walletBeforeWire.body?.balance ?? 0

  const wireApprove = await api(
    `${adminBillingBase}/wire-transfers/${encodeURIComponent(wireRequestId)}/approve`,
    { method: 'POST', headers: auth },
  )
  if (!wireApprove.ok || wireApprove.body?.status !== 'credited') {
    fail('wire-transfer-approve', `HTTP ${wireApprove.status} ${JSON.stringify(wireApprove.body)}`)
  }
  if ((wireApprove.body?.walletBalanceAfter ?? 0) < balanceBeforeWire + wirePoints) {
    fail(
      'wire-transfer-balance',
      `expected >= ${balanceBeforeWire + wirePoints}, got ${wireApprove.body?.walletBalanceAfter}`,
    )
  }
  passed.push('wire-transfer-approve')

  console.log(`billing smoke OK (${passed.length} steps): ${passed.join(', ')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
