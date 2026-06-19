import { GitCompareIcon, LayoutListIcon } from 'lucide-react'

import {
  MENU_OVERRIDE_ENABLED_OPTIONS,
  type MenuOverrideEnabledValue,
  findMenuDiffEntry,
} from '~/features/tenants/lib/menu-override-options'
import type { TenantMenuDiffEntry } from '~/entities/tenant/model'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

function resolveDisplayTitle(
  overrideTitle: string,
  templateTitle: string | undefined,
): string {
  const trimmed = overrideTitle.trim()
  if (trimmed) return trimmed
  if (templateTitle) return templateTitle
  return '—'
}

export function MenuOverridePreview({
  itemId,
  enabled,
  title,
  sortOrder,
  diffEntries,
}: {
  itemId: string
  enabled: MenuOverrideEnabledValue
  title: string
  sortOrder: string
  diffEntries?: TenantMenuDiffEntry[]
}) {
  const template = findMenuDiffEntry(diffEntries, itemId)
  const enabledMeta = MENU_OVERRIDE_ENABLED_OPTIONS.find((option) => option.value === enabled)
  const displayItemId = itemId.trim() || 'menu-item-id'
  const displayTitle = resolveDisplayTitle(title, template?.templateTitle)
  const displaySort =
    sortOrder.trim() || (template?.templateSortOrder != null ? String(template.templateSortOrder) : '继承')

  return (
    <div className="admin-menu-override-preview rounded-xl border border-primary/25 bg-primary/6 p-4">
      <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
        Diff Preview
      </p>
      <div className="mt-3 flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/12"
          aria-hidden
        >
          <LayoutListIcon className="size-4 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-medium">{displayItemId}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{displayTitle}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <AdminStatusPill
              level={enabledMeta?.level ?? 'info'}
              label={enabledMeta?.label ?? '继承模板'}
            />
            <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              sort {displaySort}
            </span>
          </div>
        </div>
        <GitCompareIcon className="size-4 shrink-0 text-primary/50" aria-hidden />
      </div>
      {template ? (
        <dl className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
          <div className="flex flex-wrap justify-between gap-2">
            <dt>平台模板</dt>
            <dd className="text-right">
              {template.templateTitle}
              <span className="ml-1.5 font-mono">
                · {template.templateEnabled ? '启用' : '禁用'}
                {template.templateSortOrder != null ? ` · #${template.templateSortOrder}` : ''}
              </span>
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          未匹配到平台模板项；保存后仍可作为租户级 diff 生效。
        </p>
      )}
    </div>
  )
}
