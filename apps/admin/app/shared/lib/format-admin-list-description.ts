export function appendAdminListTotal(
  description: string,
  options: {
    total?: number
    loaded?: boolean
    unit?: string
  },
): string {
  if (!options.loaded || options.total == null) return description
  const suffix = description.endsWith('。') ? '' : '。'
  return `${description}${suffix}共 ${options.total} ${options.unit ?? '条'}。`
}
