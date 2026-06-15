export type RechargePayLaunchKind = 'http' | 'weixin-native' | 'weixin-jsapi' | 'unsupported'

export function classifyRechargePayLaunch(
  payUrl: string,
  payScene?: string | null,
): RechargePayLaunchKind {
  if (/^https?:\/\//i.test(payUrl)) {
    return 'http'
  }
  if (payUrl.startsWith('weixin://')) {
    return payScene === 'jsapi' ? 'weixin-jsapi' : 'weixin-native'
  }
  return 'unsupported'
}

export function canOpenRechargePayUrl(payUrl: string): boolean {
  return /^https?:\/\//i.test(payUrl)
}

export function openRechargePayUrl(payUrl: string): boolean {
  if (!canOpenRechargePayUrl(payUrl)) {
    return false
  }
  window.open(payUrl, '_blank', 'noopener,noreferrer')
  return true
}

export function rechargePayLaunchHint(kind: RechargePayLaunchKind): string {
  switch (kind) {
    case 'http':
      return '点击下方按钮将在新窗口打开支付页面，完成支付后返回此页刷新余额。'
    case 'weixin-native':
      return '请使用微信扫描 payUrl 中的链接或使用微信客户端完成 Native 扫码支付。'
    case 'weixin-jsapi':
      return 'JSAPI 支付需在微信内置浏览器中打开；正式 SDK 接入后将自动调起微信支付。'
    default:
      return '当前 payUrl 无法自动调起，请按运维提供的说明完成支付。'
  }
}
