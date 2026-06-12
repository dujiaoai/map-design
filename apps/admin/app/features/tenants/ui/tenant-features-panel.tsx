import { Button, cn } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  fetchFeatureCatalog,
  fetchTenantFeatures,
  updateTenantFeatures,
} from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminFormError } from '~/shared/ui/admin-field'

export function TenantFeaturesPanel({ tenantId }: { tenantId: string }) {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const queryClient = useQueryClient()
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const catalogQuery = useQuery({
    queryKey: adminQueryKeys.featureCatalog,
    queryFn: fetchFeatureCatalog,
  })

  const featuresQuery = useQuery({
    queryKey: adminQueryKeys.tenantFeatures(tenantId),
    queryFn: () => fetchTenantFeatures(tenantId),
  })

  useEffect(() => {
    if (featuresQuery.data) {
      setSelectedCodes(featuresQuery.data.featureCodes)
      setFormError(null)
    }
  }, [featuresQuery.data])

  const mutation = useMutation({
    mutationFn: (codes: string[]) => updateTenantFeatures(tenantId, codes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantFeatures(tenantId) })
      setFormError(null)
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  function toggleFeature(code: string) {
    setSelectedCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    )
  }

  if (catalogQuery.isLoading || featuresQuery.isLoading) {
    return <AdminEmptyState message="加载能力配置…" />
  }

  if (catalogQuery.isError || featuresQuery.isError) {
    return <AdminEmptyState message="加载失败，请刷新重试" />
  }

  const catalog = catalogQuery.data?.features ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          已开通 {selectedCodes.length} 项能力；保存后全量替换。
        </p>
        {canWrite ? (
          <Button onClick={() => mutation.mutate(selectedCodes)} disabled={mutation.isPending}>
            {mutation.isPending ? '保存中…' : '保存能力'}
          </Button>
        ) : null}
      </div>

      <AdminPanel className="p-0">
        <ul className="grid gap-2 p-5 md:grid-cols-2">
          {catalog.map((feature) => {
            const checked = selectedCodes.includes(feature.code)
            return (
              <li key={feature.code}>
                <label
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-lg border px-3 py-3 transition-colors',
                    checked
                      ? 'border-primary/40 bg-primary/8'
                      : 'border-border/60 hover:bg-muted/25',
                    !canWrite && 'cursor-default opacity-80',
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    disabled={!canWrite}
                    onChange={() => toggleFeature(feature.code)}
                  />
                  <span className="min-w-0">
                    <span className="block font-mono text-xs">{feature.code}</span>
                    <span className="mt-0.5 block text-sm">{feature.name}</span>
                    {feature.description ? (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {feature.description}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        <div className="border-t border-border/60 px-5 py-4">
          <AdminFormError message={formError} />
        </div>
      </AdminPanel>
    </div>
  )
}
