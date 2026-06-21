import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Input,
  cn,
  toast,
} from '@repo/ui'
import { BoxesIcon, PlusIcon, SparklesIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  createAdminProduct,
  createAdminProductFeature,
  fetchAdminProductFeatureCatalog,
  fetchAdminProducts,
  type AdminProduct,
} from '~/shared/api/admin-api'
import { AdminAntModal } from '~/shared/ant'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminSidebarListSkeleton } from '~/shared/ui/admin-table-skeleton'

function formatCreatedAt(epochMs: number) {
  if (!epochMs) return '—'
  return new Date(epochMs).toLocaleDateString('zh-CN')
}

export function ProductsAdminPage() {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const queryClient = useQueryClient()

  const productsQuery = useQuery({
    queryKey: adminQueryKeys.products,
    queryFn: fetchAdminProducts,
  })

  const products = productsQuery.data?.products ?? []
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!products.length) {
      setSelectedCode(null)
      return
    }
    if (!selectedCode || !products.some((product) => product.code === selectedCode)) {
      setSelectedCode(products[0]?.code ?? null)
    }
  }, [products, selectedCode])

  const selectedProduct = useMemo(
    () => products.find((product) => product.code === selectedCode) ?? null,
    [products, selectedCode],
  )

  const featuresQuery = useQuery({
    queryKey: adminQueryKeys.productFeatures(selectedCode ?? ''),
    queryFn: () => fetchAdminProductFeatureCatalog(selectedCode!),
    enabled: Boolean(selectedCode),
  })

  const features = featuresQuery.data?.features ?? []

  const [createProductOpen, setCreateProductOpen] = useState(false)
  const [createProductError, setCreateProductError] = useState<string | null>(null)
  const [productCode, setProductCode] = useState('')
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')

  const [createFeatureOpen, setCreateFeatureOpen] = useState(false)
  const [createFeatureError, setCreateFeatureError] = useState<string | null>(null)
  const [featureCode, setFeatureCode] = useState('')
  const [featureName, setFeatureName] = useState('')
  const [featureDescription, setFeatureDescription] = useState('')

  const createProductMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: async (product) => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.products })
      setCreateProductOpen(false)
      setProductCode('')
      setProductName('')
      setProductDescription('')
      setCreateProductError(null)
      setSelectedCode(product.code)
      toast.success(`产品线「${product.name}」已注册`)
    },
    onError: (error) => setCreateProductError(formatAdminApiError(error)),
  })

  const createFeatureMutation = useMutation({
    mutationFn: (payload: { code: string; name: string; description?: string }) =>
      createAdminProductFeature(selectedCode!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.productFeatures(selectedCode!),
      })
      setCreateFeatureOpen(false)
      setFeatureCode('')
      setFeatureName('')
      setFeatureDescription('')
      setCreateFeatureError(null)
      toast.success('能力码已注册')
    },
    onError: (error) => setCreateFeatureError(formatAdminApiError(error)),
  })

  function openCreateProduct() {
    setCreateProductError(null)
    setProductCode('')
    setProductName('')
    setProductDescription('')
    setCreateProductOpen(true)
  }

  function openCreateFeature() {
    if (!selectedCode) return
    setCreateFeatureError(null)
    setFeatureCode('')
    setFeatureName('')
    setFeatureDescription('')
    setCreateFeatureOpen(true)
  }

  function submitCreateProduct() {
    const code = productCode.trim().toLowerCase()
    const name = productName.trim()
    if (!code || !name) {
      setCreateProductError('请填写产品码与显示名')
      return
    }
    createProductMutation.mutate({
      code,
      name,
      ...(productDescription.trim() ? { description: productDescription.trim() } : {}),
    })
  }

  function submitCreateFeature() {
    const code = featureCode.trim()
    const name = featureName.trim()
    if (!code || !name) {
      setCreateFeatureError('请填写能力码与显示名')
      return
    }
    createFeatureMutation.mutate({
      code,
      name,
      ...(featureDescription.trim() ? { description: featureDescription.trim() } : {}),
    })
  }

  return (
    <div className="admin-page flex min-h-0 flex-1 flex-col gap-4">
      <AdminPageHeader
        eyebrow="Product Registry"
        title="产品线"
        description="注册 SaaS 产品线及其 tenantFeature 能力码，供租户归属与能力开通校验。"
        actions={
          canWrite ? (
            <Button type="button" size="sm" onClick={openCreateProduct}>
              <PlusIcon className="size-4" aria-hidden />
              注册产品线
            </Button>
          ) : null
        }
      />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <AdminPanel className="flex min-h-[320px] flex-col">
          <AdminPanelHeader title={`已注册产品（${products.length}）`} />
          <div className="admin-scroll-area flex-1 p-2">
            {productsQuery.isLoading ? (
              <AdminSidebarListSkeleton rows={4} />
            ) : products.length === 0 ? (
              <AdminEmptyState
                icon={BoxesIcon}
                message="暂无产品线。通过「注册产品线」创建第一条 SaaS 产品线。"
              />
            ) : (
              <ul className="space-y-1">
                {products.map((product) => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    selected={product.code === selectedCode}
                    onSelect={() => setSelectedCode(product.code)}
                  />
                ))}
              </ul>
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="flex min-h-[320px] flex-col">
          {!selectedProduct ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <AdminEmptyState
                icon={SparklesIcon}
                message="从左侧选择产品线以查看详情与能力码目录。"
              />
            </div>
          ) : (
            <>
              <AdminPanelHeader
                title={selectedProduct.name}
                description={selectedProduct.code}
                actions={
                  canWrite ? (
                    <Button type="button" size="sm" variant="outline" onClick={openCreateFeature}>
                      <PlusIcon className="size-4" aria-hidden />
                      注册能力码
                    </Button>
                  ) : null
                }
              />
              <div className="space-y-4 border-b border-border/50 px-4 pb-4">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">状态</dt>
                    <dd className="mt-1">
                      <Badge variant={selectedProduct.status === 'active' ? 'default' : 'secondary'}>
                        {selectedProduct.status === 'active' ? '启用' : '停用'}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">注册时间</dt>
                    <dd className="mt-1">{formatCreatedAt(selectedProduct.createdAt)}</dd>
                  </div>
                </dl>
                {selectedProduct.description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedProduct.description}
                  </p>
                ) : null}
              </div>

              <div className="admin-scroll-area flex-1 p-4">
                <h3 className="admin-display mb-3 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  tenantFeature 能力码
                </h3>
                {featuresQuery.isLoading ? (
                  <AdminSidebarListSkeleton rows={3} />
                ) : features.length === 0 ? (
                  <AdminEmptyState
                    icon={SparklesIcon}
                    message="暂无能力码。注册 tenantFeature 后，租户能力 Tab 将按此目录校验可开通项。"
                  />
                ) : (
                  <ul className="space-y-2">
                    {features.map((feature) => (
                      <li
                        key={feature.code}
                        className="rounded-xl border border-border/50 bg-background/20 px-3 py-2.5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="text-xs text-primary">{feature.code}</code>
                          <span className="text-sm font-medium">{feature.name}</span>
                        </div>
                        {feature.description ? (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {feature.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </AdminPanel>
      </div>

      <AdminAntModal
        open={createProductOpen}
        title="注册产品线"
        okText={createProductMutation.isPending ? '提交中…' : '注册'}
        cancelText="取消"
        confirmLoading={createProductMutation.isPending}
        onCancel={() => {
          if (createProductMutation.isPending) return
          setCreateProductOpen(false)
        }}
        onOk={submitCreateProduct}
      >
        <div className="space-y-4 pt-1">
          <AdminField label="产品码" htmlFor="product-code">
            <Input
              id="product-code"
              className="font-mono"
              placeholder="uav-cloud"
              value={productCode}
              onChange={(event) => setProductCode(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">小写字母、数字与连字符，创建后不可修改。</p>
          </AdminField>
          <AdminField label="显示名" htmlFor="product-name">
            <Input
              id="product-name"
              placeholder="机库云"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </AdminField>
          <AdminField label="说明" htmlFor="product-description">
            <Input
              id="product-description"
              placeholder="可选"
              value={productDescription}
              onChange={(event) => setProductDescription(event.target.value)}
            />
          </AdminField>
          <AdminFormError message={createProductError} />
        </div>
      </AdminAntModal>

      <AdminAntModal
        open={createFeatureOpen}
        title={`为「${selectedProduct?.name ?? ''}」注册能力码`}
        okText={createFeatureMutation.isPending ? '提交中…' : '注册'}
        cancelText="取消"
        confirmLoading={createFeatureMutation.isPending}
        onCancel={() => {
          if (createFeatureMutation.isPending) return
          setCreateFeatureOpen(false)
        }}
        onOk={submitCreateFeature}
      >
        <div className="space-y-4 pt-1">
          <AdminField label="能力码" htmlFor="feature-code">
            <Input
              id="feature-code"
              className="font-mono"
              placeholder="uav.dock-monitor"
              value={featureCode}
              onChange={(event) => setFeatureCode(event.target.value)}
            />
          </AdminField>
          <AdminField label="显示名" htmlFor="feature-name">
            <Input
              id="feature-name"
              placeholder="机库监控"
              value={featureName}
              onChange={(event) => setFeatureName(event.target.value)}
            />
          </AdminField>
          <AdminField label="说明" htmlFor="feature-description">
            <Input
              id="feature-description"
              placeholder="可选"
              value={featureDescription}
              onChange={(event) => setFeatureDescription(event.target.value)}
            />
          </AdminField>
          <AdminFormError message={createFeatureError} />
        </div>
      </AdminAntModal>
    </div>
  )
}

function ProductListItem({
  product,
  selected,
  onSelect,
}: {
  product: AdminProduct
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
          selected
            ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/20'
            : 'border-transparent hover:border-border/50 hover:bg-background/30',
        )}
      >
        <p className="text-sm font-medium">{product.name}</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{product.code}</p>
      </button>
    </li>
  )
}
