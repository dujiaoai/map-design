import { describe, expect, it, vi } from 'vitest'

import {
  buildWechatOAuthAuthorizeUrl,
  currentBillingOAuthRedirectUri,
  parseWechatOAuthCallback,
  WECHAT_OAUTH_STATE,
} from './wechat-oauth'

describe('wechat-oauth', () => {
  it('builds snsapi_base authorize url', () => {
    const url = buildWechatOAuthAuthorizeUrl('wx_app', 'https://app.example/billing')
    expect(url).toContain('open.weixin.qq.com/connect/oauth2/authorize')
    expect(url).toContain('appid=wx_app')
    expect(url).toContain(encodeURIComponent('https://app.example/billing'))
    expect(url).toContain(`state=${WECHAT_OAUTH_STATE}`)
    expect(url).toContain('scope=snsapi_base')
  })

  it('parses oauth callback query', () => {
    expect(parseWechatOAuthCallback('?code=abc&state=billing-jsapi')).toEqual({
      code: 'abc',
      state: 'billing-jsapi',
    })
    expect(parseWechatOAuthCallback('?foo=1')).toBeNull()
  })

  it('strips oauth params from redirect uri helper', () => {
    vi.stubGlobal('window', {
      location: {
        href: 'https://app.example/billing?code=abc&state=billing-jsapi',
      },
    })
    expect(currentBillingOAuthRedirectUri()).toBe('https://app.example/billing')
    vi.unstubAllGlobals()
  })
})
