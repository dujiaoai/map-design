#!/usr/bin/env node
/**
 * Billing API 端到端冒烟（直连 :8083/v1/billing + :8082/v1/auth 登录）。
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
const saasBase = (process.env.SAAS_API_BASE_URL ?? 'http://localhost:8082/v1').replace(/\/$/, '')

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

  console.log(`billing smoke OK (${passed.length} steps): ${passed.join(', ')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
