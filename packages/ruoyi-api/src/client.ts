export class RuoYiApiError extends Error {
  readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'RuoYiApiError'
    this.code = code
  }
}

export interface RuoYiClientOptions {
  baseUrl: string
  getAccessToken?: () => string | null
  fetch?: typeof fetch
}

interface RuoYiEnvelope {
  code: number
  msg?: string
  data?: unknown
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function createRuoYiClient(options: RuoYiClientOptions) {
  const fetchFn = options.fetch ?? fetch

  async function parseEnvelope(res: Response): Promise<RuoYiEnvelope> {
    const body = (await res.json()) as RuoYiEnvelope
    if (!res.ok) {
      throw new RuoYiApiError(body.code ?? res.status, body.msg ?? `HTTP ${res.status}`)
    }
    if (body.code !== 200) {
      throw new RuoYiApiError(body.code, body.msg ?? '请求失败')
    }
    return body
  }

  async function get<T>(path: string, auth = true): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (auth) {
      const token = options.getAccessToken?.()
      if (token) headers.Authorization = `Bearer ${token}`
    }
    const res = await fetchFn(joinUrl(options.baseUrl, path), { headers })
    return parseEnvelope(res) as Promise<T>
  }

  async function post<T>(path: string, body: unknown, auth = true): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    if (auth) {
      const token = options.getAccessToken?.()
      if (token) headers.Authorization = `Bearer ${token}`
    }
    const res = await fetchFn(joinUrl(options.baseUrl, path), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    return parseEnvelope(res) as Promise<T>
  }

  async function put<T>(path: string, body: unknown, auth = true): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    if (auth) {
      const token = options.getAccessToken?.()
      if (token) headers.Authorization = `Bearer ${token}`
    }
    const res = await fetchFn(joinUrl(options.baseUrl, path), {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    return parseEnvelope(res) as Promise<T>
  }

  return { get, post, put }
}

export type RuoYiClient = ReturnType<typeof createRuoYiClient>
