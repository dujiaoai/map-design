import { describe, expect, it } from 'vitest'

import {
  canOpenRechargePayUrl,
  classifyRechargePayLaunch,
  rechargePayLaunchHint,
} from './open-recharge-pay-url'

describe('open-recharge-pay-url', () => {
  it('classifies http pay urls', () => {
    expect(classifyRechargePayLaunch('https://pay.example/h5?order=1', 'h5')).toBe('http')
    expect(canOpenRechargePayUrl('https://pay.example/h5?order=1')).toBe(true)
  })

  it('classifies weixin urls by scene', () => {
    expect(classifyRechargePayLaunch('weixin://wxpay/bizpayurl?pr=1', 'native')).toBe(
      'weixin-native',
    )
    expect(classifyRechargePayLaunch('weixin://jsapi?order=1', 'jsapi')).toBe('weixin-jsapi')
  })

  it('returns hints for launch kinds', () => {
    expect(rechargePayLaunchHint('http')).toContain('新窗口')
    expect(rechargePayLaunchHint('weixin-jsapi')).toContain('微信')
  })
})
