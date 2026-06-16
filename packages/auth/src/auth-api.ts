import type {
  AuthTokensResponse,
  LoginCredentials,
  LoginMfaCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterOrgCredentials,
  RegisterOrgResponse,
  RegisterPersonalCredentials,
  RegisterPersonalResponse,
  Session,
} from './types'

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
    async register(credentials: RegisterCredentials): Promise<void> {
      const body: Record<string, string> = {
        email: credentials.email,
        password: credentials.password,
        tenantId: credentials.tenantId ?? '',
      }
      if (credentials.displayName?.trim()) {
        body.displayName = credentials.displayName.trim()
      }
      const res = await fetchFn(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Auth API ${res.status}: ${text}`)
      }
    },

    async registerOrg(credentials: RegisterOrgCredentials): Promise<RegisterOrgResponse> {
      const body: Record<string, string> = {
        orgName: credentials.orgName.trim(),
        email: credentials.email,
        password: credentials.password,
      }
      if (credentials.slug?.trim()) {
        body.slug = credentials.slug.trim()
      }
      if (credentials.displayName?.trim()) {
        body.displayName = credentials.displayName.trim()
      }
      const res = await fetchFn(`${base}/auth/register-org`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      return parseJson(res)
    },

    async registerPersonal(
      credentials: RegisterPersonalCredentials,
    ): Promise<RegisterPersonalResponse> {
      const body: Record<string, string> = {
        email: credentials.email,
        password: credentials.password,
      }
      if (credentials.displayName?.trim()) {
        body.displayName = credentials.displayName.trim()
      }
      const res = await fetchFn(`${base}/auth/register-personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      return parseJson(res)
    },

    async resendRegistrationVerification(body: {
      email: string
      tenantId: string
    }): Promise<void> {
      const res = await fetchFn(`${base}/auth/register/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Auth API ${res.status}: ${text}`)
      }
    },

    async confirmRegistration(token: string): Promise<LoginResponse> {
      const res = await fetchFn(`${base}/auth/register/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token }),
      })
      return parseJson(res)
    },

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      const body: Record<string, string> = {
        email: credentials.email,
        password: credentials.password,
      }
      if (credentials.tenantId?.trim()) {
        body.tenantId = credentials.tenantId.trim()
      }
      const res = await fetchFn(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      return parseJson(res)
    },

    async verifyLoginMfa(credentials: LoginMfaCredentials): Promise<LoginResponse> {
      const res = await fetchFn(`${base}/auth/login/mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(credentials),
      })
      return parseJson(res)
    },

    async startOidcAuthorize(
      providerId: string,
      tenantId: string,
      client: 'admin' | 'web' = 'web',
    ) {
      const params = new URLSearchParams({
        client,
        tenantId: tenantId.trim(),
      })
      const res = await fetchFn(`${base}/auth/oidc/${encodeURIComponent(providerId)}/authorize?${params}`, {
        headers: { Accept: 'application/json' },
      })
      return parseJson(res)
    },

    async completeOidcCallback(credentials: {
      providerId: string
      code: string
      state: string
    }): Promise<LoginResponse> {
      const res = await fetchFn(
        `${base}/auth/oidc/${encodeURIComponent(credentials.providerId)}/callback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ code: credentials.code, state: credentials.state }),
        },
      )
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

    async updateSession(
      accessToken: string,
      body: { name: string; phone?: string | null; avatarUrl?: string | null },
    ): Promise<Session> {
      const res = await fetchFn(`${base}/users/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
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

    async changePassword(
      accessToken: string,
      body: { oldPassword: string; newPassword: string },
    ): Promise<void> {
      const res = await fetchFn(`${base}/users/me/password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Auth API ${res.status}: ${text}`)
      }
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

    async acceptInvite(body: { token: string; password: string }): Promise<LoginResponse> {
      const res = await fetchFn(`${base}/auth/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      return parseJson(res)
    },

    async previewInviteLink(token: string): Promise<{
      tenantName: string
      tenantSlug: string
      roleCode: string
      expiresAt: number | null
      remainingUses: number | null
    }> {
      const search = new URLSearchParams({ token })
      const res = await fetchFn(`${base}/auth/invite-links/preview?${search.toString()}`, {
        headers: { Accept: 'application/json' },
      })
      return parseJson(res)
    },

    async joinViaInviteLink(body: {
      token: string
      email: string
      password: string
      displayName?: string
    }): Promise<LoginResponse> {
      const payload: Record<string, string> = {
        token: body.token,
        email: body.email,
        password: body.password,
      }
      if (body.displayName?.trim()) {
        payload.displayName = body.displayName.trim()
      }
      const res = await fetchFn(`${base}/auth/join-via-invite-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      return parseJson(res)
    },

    async requestPasswordReset(body: {
      email: string
      tenantId: string
      clientApp?: 'web' | 'admin'
    }): Promise<void> {
      const payload: Record<string, string> = {
        email: body.email,
        tenantId: body.tenantId,
      }
      if (body.clientApp) {
        payload.clientApp = body.clientApp
      }
      const res = await fetchFn(`${base}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Auth API ${res.status}: ${text}`)
      }
    },

    async confirmPasswordReset(body: { token: string; password: string }): Promise<LoginResponse> {
      const res = await fetchFn(`${base}/auth/password-reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      return parseJson(res)
    },
  }
}

export type AuthApi = ReturnType<typeof createAuthApi>
