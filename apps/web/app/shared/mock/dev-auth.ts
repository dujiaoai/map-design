import type { CaptchaResult, UserInfo } from '@repo/ruoyi-api'

/** 本地 mock 登录 access token，bootstrap 据此跳过 RuoYi 请求 */
export const MOCK_ACCESS_TOKEN = 'mock-dev-access-token'

const MOCK_CAPTCHA_IMG =
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export function getMockCaptcha(): CaptchaResult {
  return {
    captchaEnabled: true,
    uuid: 'mock-captcha-uuid',
    img: MOCK_CAPTCHA_IMG,
  }
}

export function isMockAccessToken(token: string | null | undefined): boolean {
  return token === MOCK_ACCESS_TOKEN
}

export function createMockUserInfo(username: string): UserInfo {
  const name = username.trim() || 'dev'
  return {
    user: {
      userId: '1',
      userName: name,
      nickName: name,
      email: name.includes('@') ? name : `${name}@yunyan.local`,
    },
    roles: ['common'],
    permissions: ['*:*:*'],
  }
}
