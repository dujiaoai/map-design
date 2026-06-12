import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'

export function formatProfileUpdateError(error: unknown): string {
  return formatAdminApiError(error)
}

export function formatPasswordChangeError(error: unknown): string {
  if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
    return '当前密码不正确'
  }
  return formatAdminApiError(error)
}
