import type { RuoYiClient } from './client'

export interface CaptchaResult {
  img: string
  uuid: string
  captchaEnabled: boolean
}

interface CaptchaEnvelope {
  img?: string
  uuid?: string
  captchaEnabled?: boolean
}

export async function getCodeImg(client: RuoYiClient): Promise<CaptchaResult> {
  const body = await client.get<CaptchaEnvelope>('/code', false)
  return {
    img: body.img ?? '',
    uuid: body.uuid ?? '',
    captchaEnabled: body.captchaEnabled === undefined ? true : body.captchaEnabled,
  }
}

export interface LoginParams {
  username: string
  password: string
  code: string
  uuid: string
}

interface LoginEnvelope {
  data?: { access_token?: string }
}

export async function login(client: RuoYiClient, params: LoginParams): Promise<string> {
  const body = await client.post<LoginEnvelope>(
    '/auth/login',
    {
      username: params.username.trim(),
      password: params.password,
      code: params.code,
      uuid: params.uuid,
    },
    false,
  )
  const token = body.data?.access_token
  if (!token) {
    throw new Error('登录响应缺少 access_token')
  }
  return token
}
