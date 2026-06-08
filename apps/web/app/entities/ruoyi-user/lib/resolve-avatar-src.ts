export const DEFAULT_AVATAR_URL = '/avatars/shadcn.jpg'

export function isBlankAvatarValue(value: string | null | undefined): boolean {
  if (value == null) return true
  const trimmed = value.trim()
  return trimmed === '' || trimmed === '#' || trimmed === 'null' || trimmed === 'undefined'
}

function withApiBase(path: string): string {
  const base = '/YunYanApi'.replace(/\/$/, '')
  return `${base}${path}`
}

/** 解析 RuoYi user.icon / user.avatar 为可展示的 img src */
export function resolveAvatarSrc(raw: string | null | undefined): string {
  if (isBlankAvatarValue(raw)) return DEFAULT_AVATAR_URL

  const value = raw!.trim()

  if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  if (value.startsWith('/9j/')) return `data:image/jpeg;base64,${value}`
  if (value.startsWith('iVBORw0KG')) return `data:image/png;base64,${value}`
  if (value.startsWith('R0lGOD')) return `data:image/gif;base64,${value}`

  if (value.startsWith('/')) {
    if (value.startsWith('/avatars/') || value.startsWith('/images/')) {
      return value
    }
    return withApiBase(value)
  }

  return `data:image/png;base64,${value}`
}
