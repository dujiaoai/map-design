import type { AdminStatusLevel } from '~/shared/ui/admin-status-pill'
import type { TenantMenuDiffEntry } from '~/entities/tenant/model'

export type MenuOverrideEnabledValue = 'inherit' | 'true' | 'false'

export const MENU_OVERRIDE_ENABLED_OPTIONS: {
  value: MenuOverrideEnabledValue
  label: string
  hint: string
  level: AdminStatusLevel
}[] = [
  { value: 'inherit', label: '继承模板', hint: '不覆盖启用状态', level: 'info' },
  { value: 'true', label: '强制启用', hint: '租户侧始终显示', level: 'ok' },
  { value: 'false', label: '强制禁用', hint: '租户侧隐藏该项', level: 'off' },
]

export const MENU_OVERRIDE_ITEM_PRESETS = [
  { itemId: 'tool-measure-distance', label: '测距工具' },
  { itemId: 'tool-measure-area', label: '测面工具' },
  { itemId: 'tool-map-search', label: '地图搜索' },
  { itemId: 'tool-legend', label: '图例' },
] as const

export function resolveMenuOverrideEnabled(
  enabled: boolean | null | undefined,
): MenuOverrideEnabledValue {
  if (enabled == null) return 'inherit'
  return enabled ? 'true' : 'false'
}

export function menuOverrideEnabledLabel(enabled: boolean | null | undefined): string {
  if (enabled == null) return '继承'
  return enabled ? '强制启用' : '强制禁用'
}

export function menuOverrideEnabledLevel(enabled: boolean | null | undefined): AdminStatusLevel {
  if (enabled == null) return 'info'
  return enabled ? 'ok' : 'off'
}

export function findMenuDiffEntry(
  entries: TenantMenuDiffEntry[] | undefined,
  itemId: string,
): TenantMenuDiffEntry | undefined {
  const trimmed = itemId.trim()
  if (!trimmed) return undefined
  return entries?.find((entry) => entry.itemId === trimmed)
}
