import type { AuthTokensResponse, LoginCredentials, LoginResponse, Session } from './types'

export interface AuthApiOptions {
  baseUrl: string
  fetch?: typeof fetch
}

export function createAuthApi(options: AuthApiOptions) {
  const fetchFn = options.fetch ?? fetch
  const base = options.baseUrl.replace(/\/$/, '')

  async function parseJson<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Auth API ${res.status}: ${body}`)
    }
    return res.json() as Promise<T>
  }

  return {
    async register(credentials: LoginCredentials): Promise<LoginResponse> {
      const res = await fetchFn(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(credentials),
      })
      return parseJson(res)
    },

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      const res = await fetchFn(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(credentials),
      })
      return parseJson(res)
    },

    async refresh(refreshToken: string): Promise<AuthTokensResponse> {
      const res = await fetchFn(`${base}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      return parseJson(res)
    },

    async getSession(accessToken: string): Promise<Session> {
      const res = await fetchFn(`${base}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })
      return parseJson(res)
    },

    async logout(accessToken: string): Promise<void> {
      await fetchFn(`${base}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })
    },
  }
}

export type AuthApi = ReturnType<typeof createAuthApi>
