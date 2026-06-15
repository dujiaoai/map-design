export const RECHARGE_CHANNELS = [
  { value: 'mock', label: '沙箱模拟' },
  { value: 'wechat', label: '微信支付' },
  { value: 'alipay', label: '支付宝' },
] as const

export type RechargeChannel = (typeof RECHARGE_CHANNELS)[number]['value']

export const WECHAT_PAY_SCENES = [
  { value: 'native', label: 'Native 扫码' },
  { value: 'h5', label: 'H5 网页' },
  { value: 'jsapi', label: 'JSAPI（微信内）' },
] as const

export const ALIPAY_PAY_SCENES = [
  { value: 'wap', label: '手机网站' },
  { value: 'native', label: '电脑网站' },
] as const

export type RechargePayScene =
  | (typeof WECHAT_PAY_SCENES)[number]['value']
  | (typeof ALIPAY_PAY_SCENES)[number]['value']

export function payScenesForChannel(channel: RechargeChannel) {
  if (channel === 'wechat') return WECHAT_PAY_SCENES
  if (channel === 'alipay') return ALIPAY_PAY_SCENES
  return []
}

export function defaultPaySceneForChannel(channel: RechargeChannel): RechargePayScene | undefined {
  if (channel === 'wechat') return 'native'
  if (channel === 'alipay') return 'wap'
  return undefined
}
