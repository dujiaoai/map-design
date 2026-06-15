import { useCallback, useEffect, useState } from 'react'

import type { RechargeChannel, RechargePayScene } from '~/features/billing/lib/payment-channel-options'
import {
  buildWechatOAuthAuthorizeUrl,
  cleanWechatOAuthQueryFromUrl,
  consumePendingRechargeIntent,
  currentBillingOAuthRedirectUri,
  getCachedWechatOpenId,
  parseWechatOAuthCallback,
  savePendingRechargeIntent,
  setCachedWechatOpenId,
  WECHAT_OAUTH_STATE,
  type PendingRechargeIntent,
} from '~/features/billing/lib/wechat-oauth'
import { isWeChatInAppBrowser } from '~/features/billing/lib/open-recharge-pay-url'
import { billingClient } from '~/shared/api/billing-client'

export function useWechatJsapiOAuth() {
  const [openId, setOpenId] = useState<string | null>(() => getCachedWechatOpenId())
  const [oauthReady, setOauthReady] = useState(false)
  const [pendingResume, setPendingResume] = useState<PendingRechargeIntent | null>(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrapOAuth() {
      const cached = getCachedWechatOpenId()
      if (cached) {
        setOpenId(cached)
      }

      const callback = parseWechatOAuthCallback(window.location.search)
      if (callback?.state === WECHAT_OAUTH_STATE) {
        try {
          const result = await billingClient.exchangeWechatOAuthCode(callback.code)
          setCachedWechatOpenId(result.openId)
          if (!cancelled) {
            setOpenId(result.openId)
          }
        } catch {
          // caller may surface error when recharge fails
        } finally {
          cleanWechatOAuthQueryFromUrl()
        }
        const pending = consumePendingRechargeIntent()
        if (pending && !cancelled) {
          setPendingResume(pending)
        }
      }

      if (!cancelled) {
        setOauthReady(true)
      }
    }

    void bootstrapOAuth()
    return () => {
      cancelled = true
    }
  }, [])

  const ensureOpenId = useCallback(
    async (pending?: PendingRechargeIntent): Promise<'redirecting' | string | null> => {
      const cached = getCachedWechatOpenId()
      if (cached) {
        setOpenId(cached)
        return cached
      }

      if (!isWeChatInAppBrowser()) {
        return null
      }

      try {
        const config = await billingClient.getWechatOAuthConfig()
        if (!config.enabled || !config.appId) {
          return null
        }
        if (pending) {
          savePendingRechargeIntent(pending)
        }
        const redirectUri = currentBillingOAuthRedirectUri()
        window.location.href = buildWechatOAuthAuthorizeUrl(config.appId, redirectUri)
        return 'redirecting'
      } catch {
        return null
      }
    },
    [],
  )

  const clearPendingResume = useCallback(() => {
    setPendingResume(null)
  }, [])

  return {
    openId,
    oauthReady,
    pendingResume,
    clearPendingResume,
    ensureOpenId,
  }
}

export type WechatJsapiRechargeContext = {
  channel: RechargeChannel
  payScene: RechargePayScene
  packageCode: string
  couponCode?: string
}

export async function resolveWechatOpenIdForRecharge(
  ensureOpenId: (pending?: PendingRechargeIntent) => Promise<'redirecting' | string | null>,
  context: WechatJsapiRechargeContext,
): Promise<'redirecting' | string | undefined> {
  if (context.channel !== 'wechat' || context.payScene !== 'jsapi') {
    return undefined
  }
  const resolved = await ensureOpenId({
    packageCode: context.packageCode,
    couponCode: context.couponCode,
    channel: context.channel,
    payScene: context.payScene,
  })
  if (resolved === 'redirecting') {
    return 'redirecting'
  }
  return resolved ?? undefined
}
