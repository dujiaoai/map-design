import { ApiError } from '@repo/api-client'

interface ProblemBody {
  detail?: string
  title?: string
}

function readProblemDetail(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const problem = body as ProblemBody
  return problem.detail ?? problem.title ?? null
}

export function formatAdminApiError(error: unknown, fallback = '操作失败，请稍后重试'): string {
  if (error instanceof ApiError) {
    const detail = readProblemDetail(error.body)
    if (detail) return detail
    if (error.status === 403) return '无权执行此操作'
    if (error.status === 404) return '资源不存在'
    if (error.status === 400) return '请求参数无效，请检查 UUID 等筛选条件格式'
    if (error.status === 409) {
      if (detail?.toLowerCase().includes('email')) return '该邮箱在此租户下已注册'
      if (detail?.toLowerCase().includes('slug')) return '租户 slug 已存在'
      return detail ?? '数据冲突，请刷新后重试'
    }
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
