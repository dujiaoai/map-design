import type { RechargeChannel, RechargePayScene } from '~/features/billing/lib/payment-channel-options'

export const WECHAT_OPENID_STORAGE_KEY = 'yunyan.billing.wechatOpenId'
export const WECHAT_OAUTH_STATE = 'billing-jsapi'
export const PENDING_RECHARGE_STORAGE_KEY = 'yunyan.billing.pendingRecharge'

export type PendingRechargeIntent = {
  packageCode: string
  couponCode?: string
  channel: RechargeChannel
  payScene: RechargePayScene
}

export function getCachedWechatOpenId(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null
  }
  return sessionStorage.getItem(WECHAT_OPENID_STORAGE_KEY)
}

export function setCachedWechatOpenId(openId: string): void {
  sessionStorage.setItem(WECHAT_OPENID_STORAGE_KEY, openId)
}

export function savePendingRechargeIntent(intent: PendingRechargeIntent): void {
  sessionStorage.setItem(PENDING_RECHARGE_STORAGE_KEY, JSON.stringify(intent))
}

export function consumePendingRechargeIntent(): PendingRechargeIntent | null {
  const raw = sessionStorage.getItem(PENDING_RECHARGE_STORAGE_KEY)
  if (!raw) {
    return null
  }
  sessionStorage.removeItem(PENDING_RECHARGE_STORAGE_KEY)
  try {
    return JSON.parse(raw) as PendingRechargeIntent
  } catch {
    return null
  }
}

export function currentBillingOAuthRedirectUri(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.hash = ''
  return url.toString()
}

export function buildWechatOAuthAuthorizeUrl(appId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    appid: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'snsapi_base',
    state: WECHAT_OAUTH_STATE,
  })
  return `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`
}

export function parseWechatOAuthCallback(search: string): { code: string; state: string } | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const code = params.get('code')
  const state = params.get('state')
  if (!code || !state) {
    return null
  }
  return { code, state }
}

export function cleanWechatOAuthQueryFromUrl(): void {
  if (typeof window === 'undefined') {
    return
  }
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
}

export type EnsureWechatOpenIdResult = 'redirecting' | string | null
