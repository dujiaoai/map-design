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
    if (error.status === 409) return '数据冲突，请刷新后重试'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
