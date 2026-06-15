import { Button, Checkbox, cn, toast } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SparklesIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  fetchFeatureCatalog,
  fetchTenantFeatures,
  updateTenantFeatures,
} from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { AdminFormError } from '~/shared/ui/admin-field'
import { AdminDetailSkeleton } from '~/shared/ui/admin-table-skeleton'

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
      toast.success('租户能力已保存')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  function toggleFeature(code: string) {
    setSelectedCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    )
  }

  if (catalogQuery.isLoading || featuresQuery.isLoading) {
    return <AdminDetailSkeleton />
  }

  if (catalogQuery.isError || featuresQuery.isError) {
    return (
      <AdminPanel>
        <AdminEmptyState
          icon={SparklesIcon}
          message="加载失败，请刷新重试"
          onRetry={() => {
            void catalogQuery.refetch()
            void featuresQuery.refetch()
          }}
          isRetrying={catalogQuery.isFetching || featuresQuery.isFetching}
        />
      </AdminPanel>
    )
  }

  const catalog = catalogQuery.data?.features ?? []

  return (
    <div className="space-y-4 admin-stagger">
      <AdminPanel>
        <AdminPanelHeader
          icon={SparklesIcon}
          title="租户能力"
          description={`已开通 ${selectedCodes.length} 项；保存后全量替换 featureCodes。`}
          actions={
            canWrite ? (
              <Button
                size="sm"
                onClick={() => mutation.mutate(selectedCodes)}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? '保存中…' : '保存能力'}
              </Button>
            ) : null
          }
        />
        <ul className="grid gap-2 p-4 md:grid-cols-2 md:p-5">
          {catalog.map((feature) => {
            const checked = selectedCodes.includes(feature.code)
            return (
              <li key={feature.code}>
                <label
                  className={cn(
                    'admin-quick-link flex cursor-pointer gap-3 rounded-xl border px-3 py-3',
                    checked
                      ? 'border-primary/40 bg-primary/8'
                      : 'border-border/60 bg-muted/10',
                    !canWrite && 'cursor-default opacity-80',
                  )}
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={checked}
                    disabled={!canWrite}
                    onCheckedChange={() => toggleFeature(feature.code)}
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
        <div className="border-t border-border/60 px-4 py-4 md:px-5">
          <AdminFormError message={formError} />
        </div>
      </AdminPanel>
    </div>
  )
}
