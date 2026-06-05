import {
  getCodeImg as fetchCodeImg,
  login as ruoyiLogin,
  type CaptchaResult,
  type LoginParams,
} from '@haoxuan/ruoyi-api'

import { ruoyi } from '~/shared/queries/ruoyi-client'

export type { CaptchaResult, LoginParams }

export async function getCodeImg(): Promise<CaptchaResult> {
  return fetchCodeImg(ruoyi)
}

export async function login(params: LoginParams): Promise<string> {
  return ruoyiLogin(ruoyi, params)
}
