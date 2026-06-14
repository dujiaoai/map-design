const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value.trim())
}

/** 校验可选 UUID 筛选项；有值但格式不对时返回错误文案。 */
export function validateOptionalUuidFilters(
  fields: Record<string, string | undefined>,
): string | null {
  for (const [label, value] of Object.entries(fields)) {
    const trimmed = value?.trim()
    if (trimmed && !isValidUuid(trimmed)) {
      return `${label}格式无效，请输入完整 UUID（如 11111111-1111-1111-1111-111111111101）`
    }
  }
  return null
}
