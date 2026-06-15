export type WechatJsapiPayParams = {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

export type WechatJsapiInvokeResult = 'ok' | 'cancel' | 'fail' | 'unavailable'

declare global {
  interface Window {
    WeixinJSBridge?: {
      invoke: (
        method: string,
        params: Record<string, string>,
        callback: (res: { err_msg?: string }) => void,
      ) => void
    }
  }
}

export function isWeChatInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  return /MicroMessenger/i.test(navigator.userAgent)
}

export function parseWechatJsapiPayUrl(payUrl: string): WechatJsapiPayParams | null {
  if (!payUrl.startsWith('weixin://jsapi?')) {
    return null
  }
  const params = new URLSearchParams(payUrl.slice('weixin://jsapi?'.length))
  const appId = params.get('appId')
  const timeStamp = params.get('timeStamp')
  const nonceStr = params.get('nonceStr')
  const packageVal = params.get('package')
  const signType = params.get('signType')
  const paySign = params.get('paySign')
  if (!appId || !timeStamp || !nonceStr || !packageVal || !signType || !paySign) {
    return null
  }
  return {
    appId,
    timeStamp,
    nonceStr,
    package: packageVal,
    signType,
    paySign,
  }
}

export function invokeWechatJsapiPay(
  params: WechatJsapiPayParams,
): Promise<WechatJsapiInvokeResult> {
  if (!isWeChatInAppBrowser()) {
    return Promise.resolve('unavailable')
  }

  return new Promise((resolve) => {
    const pay = () => {
      if (!window.WeixinJSBridge) {
        resolve('unavailable')
        return
      }
      window.WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        {
          appId: params.appId,
          timeStamp: params.timeStamp,
          nonceStr: params.nonceStr,
          package: params.package,
          signType: params.signType,
          paySign: params.paySign,
        },
        (res) => {
          const msg = res.err_msg ?? ''
          if (msg.includes(':ok')) {
            resolve('ok')
            return
          }
          if (msg.includes(':cancel')) {
            resolve('cancel')
            return
          }
          resolve('fail')
        },
      )
    }

    if (typeof window.WeixinJSBridge === 'undefined') {
      document.addEventListener('WeixinJSBridgeReady', pay, { once: true })
      return
    }
    pay()
  })
}
