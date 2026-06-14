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

export interface PaymentRequiredDetail {
  type: string
  title?: string
  detail?: string
  availableBalance?: number
  requiredPoints?: number
}

export interface ApiClientOptions {
  baseUrl: string
  auth?: AuthHandlers
  fetch?: typeof fetch
  headers?: Record<string, string>
  /** RFC 7807 402 余额不足等场景；仍抛出 ApiError 供调用方处理 */
  onPaymentRequired?: (detail: PaymentRequiredDetail) => void
  /** refresh 成功后同步本地 session（如拉取 /users/me） */
  onAfterAuthRefresh?: () => void
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** 内部重试标记，避免 401 无限循环 */
  _retry?: boolean
  /** 内部重试标记，避免 perm_epoch 403 无限循环 */
  _permRetry?: boolean
}

export interface ApiClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>
  get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T>
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T>
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T>
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T>
  delete<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T>
}
