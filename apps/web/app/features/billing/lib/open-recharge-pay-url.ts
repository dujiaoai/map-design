import {
  invokeWechatJsapiPay,
  isWeChatInAppBrowser,
  parseWechatJsapiPayUrl,
} from './wechat-jsapi-pay'

export type RechargePayLaunchKind = 'http' | 'weixin-native' | 'weixin-jsapi' | 'unsupported'

export function classifyRechargePayLaunch(
  payUrl: string,
  payScene?: string | null,
): RechargePayLaunchKind {
  if (/^https?:\/\//i.test(payUrl)) {
    return 'http'
  }
  if (payUrl.startsWith('weixin://jsapi?')) {
    return 'weixin-jsapi'
  }
  if (payUrl.startsWith('weixin://')) {
    return payScene === 'jsapi' ? 'weixin-jsapi' : 'weixin-native'
  }
  return 'unsupported'
}

export function canOpenRechargePayUrl(payUrl: string, payScene?: string | null): boolean {
  const kind = classifyRechargePayLaunch(payUrl, payScene)
  if (kind === 'http') {
    return true
  }
  if (kind === 'weixin-jsapi') {
    return parseWechatJsapiPayUrl(payUrl) !== null && isWeChatInAppBrowser()
  }
  return false
}

export async function openRechargePayUrl(
  payUrl: string,
  payScene?: string | null,
): Promise<boolean> {
  const kind = classifyRechargePayLaunch(payUrl, payScene)
  if (kind === 'http') {
    window.open(payUrl, '_blank', 'noopener,noreferrer')
    return true
  }
  if (kind === 'weixin-jsapi') {
    const params = parseWechatJsapiPayUrl(payUrl)
    if (!params) {
      return false
    }
    const result = await invokeWechatJsapiPay(params)
    return result === 'ok' || result === 'cancel'
  }
  return false
}

export function rechargePayLaunchHint(kind: RechargePayLaunchKind): string {
  switch (kind) {
    case 'http':
      return '点击下方按钮将在新窗口打开支付页面，完成支付后返回此页刷新余额。'
    case 'weixin-native':
      return '请使用微信扫描 payUrl 中的链接或使用微信客户端完成 Native 扫码支付。'
    case 'weixin-jsapi':
      return isWeChatInAppBrowser()
        ? '已识别微信内置浏览器；下单后将自动调起微信支付，也可点击下方按钮重试。'
        : 'JSAPI 支付需在微信内置浏览器中打开本页后再下单。'
    default:
      return '当前 payUrl 无法自动调起，请按运维提供的说明完成支付。'
  }
}

export { isWeChatInAppBrowser } from './wechat-jsapi-pay'
