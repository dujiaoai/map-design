import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
  toast,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import type { PutTenantMenuOverridePayload } from '~/entities/tenant/model'
import { postTenantMenuOverridesBatch } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminFormError } from '~/shared/ui/admin-field'

const SAMPLE_JSON = `[
  { "itemId": "tool-measure-distance", "enabled": false },
  { "itemId": "tool-measure-area", "sortOrder": 99, "title": "自定义测面" }
]`

function parseBatchJson(raw: string): PutTenantMenuOverridePayload[] {
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('JSON 须为非空数组')
  }
  return parsed.map((item, index) => {
    if (!item || typeof item !== 'object' || !('itemId' in item)) {
      throw new Error(`第 ${index + 1} 项缺少 itemId`)
    }
    const row = item as PutTenantMenuOverridePayload
    if (!row.itemId?.trim()) {
      throw new Error(`第 ${index + 1} 项 itemId 为空`)
    }
    return {
      itemId: row.itemId.trim(),
      enabled: row.enabled ?? null,
      sortOrder: row.sortOrder ?? null,
      title: row.title ?? null,
    }
  })
}

export function TenantMenuOverrideBatchSheet({
  tenantId,
  open,
  onOpenChange,
}: {
  tenantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [jsonText, setJsonText] = useState(SAMPLE_JSON)
  const [parseError, setParseError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => {
      const overrides = parseBatchJson(jsonText)
      setParseError(null)
      return postTenantMenuOverridesBatch(tenantId, { overrides })
    },
    onSuccess: async (result) => {
      toast.success(`已批量导入 ${result.overrides.length} 条菜单覆盖`)
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantMenuOverrides(tenantId) })
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantMenuDiff(tenantId) })
      onOpenChange(false)
    },
    onError: (error) => {
      if (error instanceof SyntaxError || error instanceof Error) {
        setParseError(error.message)
      }
      toast.error(formatAdminApiError(error, '批量导入失败'))
    },
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>批量导入菜单覆盖</SheetTitle>
          <SheetDescription>
            粘贴 JSON 数组，每项含 itemId；可选 enabled、sortOrder、title。
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 py-2">
          <Textarea
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value)
              setParseError(null)
            }}
            rows={12}
            className="font-mono text-xs"
            aria-label="菜单覆盖 JSON"
          />
          <AdminFormError message={parseError} />
        </div>
        <SheetFooter>
          <Button
            type="button"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            导入
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
