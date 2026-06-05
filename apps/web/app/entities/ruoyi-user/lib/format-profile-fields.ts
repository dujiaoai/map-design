function readDeptName(dept: unknown): string | undefined {
  if (!dept || typeof dept !== 'object') return undefined
  const name = (dept as { deptName?: string }).deptName
  return name?.trim() || undefined
}

export function formatSex(sex: string | null | undefined): string {
  if (sex === '0') return '男'
  if (sex === '1') return '女'
  if (sex === '2') return '未知'
  return '-'
}

export function formatDeptLabel(dept: unknown, postGroup?: string): string {
  const deptName = readDeptName(dept)
  if (deptName && postGroup?.trim()) return `${deptName} / ${postGroup.trim()}`
  return deptName ?? postGroup?.trim() ?? '-'
}

export function formatCreateTime(user: Record<string, unknown>): string {
  const value = user.createTime
  return typeof value === 'string' && value.length > 0 ? value : '-'
}
