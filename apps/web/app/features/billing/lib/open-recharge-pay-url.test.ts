import { describe, expect, it, vi } from 'vitest'

import {
  canOpenRechargePayUrl,
  classifyRechargePayLaunch,
  rechargePayLaunchHint,
} from './open-recharge-pay-url'
import {
  invokeWechatJsapiPay,
  isWeChatInAppBrowser,
  parseWechatJsapiPayUrl,
} from './wechat-jsapi-pay'

const sampleJsapiUrl =
  'weixin://jsapi?appId=wx123&timeStamp=1710000000&nonceStr=abc&package=prepay_id%3Dwx1&signType=RSA&paySign=sig'

describe('open-recharge-pay-url', () => {
  it('classifies http pay urls', () => {
    expect(classifyRechargePayLaunch('https://pay.example/h5?order=1', 'h5')).toBe('http')
    expect(canOpenRechargePayUrl('https://pay.example/h5?order=1')).toBe(true)
  })

  it('classifies weixin urls by scene', () => {
    expect(classifyRechargePayLaunch('weixin://wxpay/bizpayurl?pr=1', 'native')).toBe(
      'weixin-native',
    )
    expect(classifyRechargePayLaunch(sampleJsapiUrl, 'jsapi')).toBe('weixin-jsapi')
  })

  it('returns hints for launch kinds', () => {
    expect(rechargePayLaunchHint('http')).toContain('新窗口')
    expect(rechargePayLaunchHint('weixin-jsapi')).toContain('微信')
  })
})

describe('wechat-jsapi-pay', () => {
  it('parses jsapi pay url params', () => {
    expect(parseWechatJsapiPayUrl(sampleJsapiUrl)).toEqual({
      appId: 'wx123',
      timeStamp: '1710000000',
      nonceStr: 'abc',
      package: 'prepay_id=wx1',
      signType: 'RSA',
      paySign: 'sig',
    })
  })

  it('detects wechat in-app browser from user agent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 MicroMessenger/8.0' })
    expect(isWeChatInAppBrowser()).toBe(true)
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/120' })
    expect(isWeChatInAppBrowser()).toBe(false)
    vi.unstubAllGlobals()
  })

  it('invokes WeixinJSBridge when available', async () => {
    vi.stubGlobal('navigator', { userAgent: 'MicroMessenger' })
    const invoke = vi.fn((_method, _params, callback) => {
      callback({ err_msg: 'get_brand_wcpay_request:ok' })
    })
    vi.stubGlobal('window', { WeixinJSBridge: { invoke } })

    await expect(
      invokeWechatJsapiPay({
        appId: 'wx123',
        timeStamp: '1',
        nonceStr: 'n',
        package: 'prepay_id=1',
        signType: 'RSA',
        paySign: 's',
      }),
    ).resolves.toBe('ok')

    expect(invoke).toHaveBeenCalledWith(
      'getBrandWCPayRequest',
      expect.objectContaining({ appId: 'wx123' }),
      expect.any(Function),
    )
    vi.unstubAllGlobals()
  })
})
