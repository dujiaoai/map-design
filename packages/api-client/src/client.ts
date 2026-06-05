import { type ApiClient, type ApiClientOptions, ApiError, type RequestOptions } from './types'

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

function buildHeaders(
  init: RequestOptions | undefined,
  defaults: Record<string, string>,
  token: string | null,
): Headers {
  const headers = new Headers(defaults)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init?.headers) {
    for (const [key, value] of new Headers(init.headers)) {
      headers.set(key, value)
    }
  }
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return headers
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetchFn = options.fetch ?? fetch
  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  }

  async function request<T>(path: string, init?: RequestOptions): Promise<T> {
    const token = options.auth?.getAccessToken() ?? null
    const url = joinUrl(options.baseUrl, path)
    const hasBody = init?.body !== undefined
    const res = await fetchFn(url, {
      ...init,
      body: hasBody ? JSON.stringify(init.body) : undefined,
      headers: buildHeaders(init, defaultHeaders, token),
    })

    if (res.status === 401 && options.auth?.refreshAccessToken && !init?._retry) {
      const newToken = await options.auth.refreshAccessToken()
      if (newToken) {
        return request<T>(path, { ...init, _retry: true })
      }
      options.auth.onUnauthorized?.()
    }

    const body = await parseBody(res)
    if (!res.ok) {
      throw new ApiError(res.status, body)
    }

    return body as T
  }

  return {
    request,
    get: (path, init) => request(path, { ...init, method: 'GET' }),
    post: (path, body, init) => request(path, { ...init, method: 'POST', body }),
    put: (path, body, init) => request(path, { ...init, method: 'PUT', body }),
    patch: (path, body, init) => request(path, { ...init, method: 'PATCH', body }),
    delete: (path, init) => request(path, { ...init, method: 'DELETE' }),
  }
}
