export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API 请求失败 (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export interface AuthHandlers {
  getAccessToken: () => string | null
  getRefreshToken?: () => string | null
  refreshAccessToken?: () => Promise<string | null>
  onUnauthorized?: () => void
}

export interface ApiClientOptions {
  baseUrl: string
  auth?: AuthHandlers
  fetch?: typeof fetch
  headers?: Record<string, string>
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** 内部重试标记，避免 401 无限循环 */
  _retry?: boolean
}

export interface ApiClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>
  get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T>
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T>
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T>
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T>
  delete<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T>
}
