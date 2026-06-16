import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GripVerticalIcon,
  LayoutListIcon,
  SaveIcon,
  WrenchIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  Checkbox,
  Input,
  cn,
  toast,
} from '@repo/ui'

import {
  fetchAdminMenus,
  updateAdminMenus,
} from '../lib/menus-admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminFormError } from '~/shared/ui/admin-field'
import {
  AdminRbacEditorSkeleton,
  AdminSidebarListSkeleton,
} from '~/shared/ui/admin-table-skeleton'

import {
  TOOLS_SECTION_ID,
  moveItemAtIndex,
  normalizeItemSortOrders,
  toMenuItemUpdate,
  type AdminMenuItem,
  type AdminMenuSection,
} from '../lib/menu-admin-types'
import { resolveMenuSectionIcon } from '../lib/menu-section-icon'

function resolveResourceId(item: AdminMenuItem): string {
  if (item.toolId) return item.toolId
  if (item.moduleId) return item.moduleId
  if (item.url) return item.url
  if (item.href) return item.href
  return '—'
}

export function MenusAdminPage() {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:menus:write')
  const queryClient = useQueryClient()

  const menusQuery = useQuery({
    queryKey: adminQueryKeys.menus,
    queryFn: fetchAdminMenus,
  })

  const [sections, setSections] = useState<AdminMenuSection[]>([])
  const [toolItems, setToolItems] = useState<AdminMenuItem[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string>('layers')
  const [formError, setFormError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  useEffect(() => {
    if (menusQuery.data) {
      setSections(menusQuery.data.sections)
      setToolItems(menusQuery.data.toolItems)
      setFormError(null)
    }
  }, [menusQuery.data])

  const selectedSection = useMemo(() => {
    if (selectedSectionId === TOOLS_SECTION_ID) return null
    return sections.find((section) => section.id === selectedSectionId) ?? null
  }, [sections, selectedSectionId])

  const selectedItems = useMemo(() => {
    if (selectedSectionId === TOOLS_SECTION_ID) {
      return [...toolItems].sort((left, right) => left.sortOrder - right.sortOrder)
    }
    return selectedSection
      ? [...selectedSection.items].sort((left, right) => left.sortOrder - right.sortOrder)
      : []
  }, [selectedSection, selectedSectionId, toolItems])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateAdminMenus({
        sections: sections.map((section) => ({
          id: section.id,
          label: section.label,
          sortOrder: section.sortOrder,
          enabled: section.enabled,
          items: normalizeItemSortOrders(section.items).map(toMenuItemUpdate),
        })),
        toolItems: normalizeItemSortOrders(toolItems).map(toMenuItemUpdate),
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.menus })
      setSections(data.sections)
      setToolItems(data.toolItems)
      setFormError(null)
      toast.success('菜单配置已保存')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  function updateSection(sectionId: string, patch: Partial<AdminMenuSection>) {
    setSections((current) =>
      current.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)),
    )
  }

  function updateItems(nextItems: AdminMenuItem[]) {
    const normalized = normalizeItemSortOrders(nextItems)
    if (selectedSectionId === TOOLS_SECTION_ID) {
      setToolItems(normalized)
      return
    }
    if (!selectedSection) return
    updateSection(selectedSection.id, { items: normalized })
  }

  function moveItem(index: number, direction: -1 | 1) {
    updateItems(moveItemAtIndex(selectedItems, index, index + direction))
  }

  function handleItemDrop(targetIndex: number) {
    if (dragIndex == null || dragIndex === targetIndex) {
      setDragIndex(null)
      setDropIndex(null)
      return
    }
    updateItems(moveItemAtIndex(selectedItems, dragIndex, targetIndex))
    setDragIndex(null)
    setDropIndex(null)
  }

  if (menusQuery.isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AdminSidebarListSkeleton rows={6} />
        <AdminRbacEditorSkeleton />
      </div>
    )
  }

  if (menusQuery.isError) {
    return (
      <AdminPanel>
        <AdminEmptyState
          icon={LayoutListIcon}
          message="加载菜单配置失败，请确认 saas-api 可达且具备 admin:menus:read。"
          onRetry={() => void menusQuery.refetch()}
          isRetrying={menusQuery.isFetching}
        />
      </AdminPanel>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="菜单配置"
        description="管理工作台侧栏分段与命令面板工具项的显隐、排序与标题。"
        actions={
          canWrite ? (
            <Button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <SaveIcon className="size-4" />
              保存
            </Button>
          ) : null
        }
      />

      {formError ? <AdminFormError message={formError} /> : null}

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AdminPanel className="p-2">
          <div className="px-2 pt-2">
            <AdminPanelHeader title="侧栏分段" />
          </div>
          <ul className="flex flex-col gap-1 p-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => setSelectedSectionId(section.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    selectedSectionId === section.id
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  )}
                >
                  {resolveMenuSectionIcon(section)}
                  <span className="min-w-0 flex-1 truncate">{section.label}</span>
                  {!section.enabled ? (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      已隐藏
                    </Badge>
                  ) : null}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setSelectedSectionId(TOOLS_SECTION_ID)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  selectedSectionId === TOOLS_SECTION_ID
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                )}
              >
                <WrenchIcon className="size-4 shrink-0" />
                命令面板工具
              </button>
            </li>
          </ul>
        </AdminPanel>

        <AdminPanel>
          {selectedSectionId === TOOLS_SECTION_ID ? (
            <AdminPanelHeader
              title="命令面板工具"
              description="map-tool 项不在侧栏展示，供快捷工具条与命令面板使用。"
            />
          ) : selectedSection ? (
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">段标题</label>
                  <Input
                    value={selectedSection.label}
                    disabled={!canWrite}
                    onChange={(event) =>
                      updateSection(selectedSection.id, { label: event.target.value })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 pt-5 text-sm">
                  <Checkbox
                    checked={selectedSection.enabled}
                    disabled={!canWrite}
                    onCheckedChange={(checked) =>
                      updateSection(selectedSection.id, { enabled: checked === true })
                    }
                  />
                  段启用
                </label>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">标题</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">关联 ID</th>
                  <th className="px-4 py-3 font-medium">能力门控</th>
                  <th className="px-4 py-3 font-medium">启用</th>
                  {canWrite ? (
                    <>
                      <th className="w-10 px-2 py-3 font-medium">
                        <span className="sr-only">拖拽</span>
                      </th>
                      <th className="px-4 py-3 font-medium">排序</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'border-b border-border/60',
                      dragIndex === index && 'opacity-50',
                      dropIndex === index && dragIndex !== null && 'bg-primary/5',
                    )}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDropIndex(index)
                    }}
                    onDragLeave={() => {
                      if (dropIndex === index) setDropIndex(null)
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      handleItemDrop(index)
                    }}
                  >
                    <td className="px-4 py-3">
                      <Input
                        value={item.title}
                        disabled={!canWrite}
                        onChange={(event) => {
                          const next = selectedItems.map((row) =>
                            row.id === item.id ? { ...row, title: event.target.value } : row,
                          )
                          updateItems(next)
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.kind}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {resolveResourceId(item)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {item.tenantFeature ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={item.enabled}
                        disabled={!canWrite}
                        onCheckedChange={(checked) => {
                          const next = selectedItems.map((row) =>
                            row.id === item.id ? { ...row, enabled: checked === true } : row,
                          )
                          updateItems(next)
                        }}
                      />
                    </td>
                    {canWrite ? (
                      <>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            draggable
                            aria-label={`拖拽排序：${item.title}`}
                            className="flex size-8 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
                            onDragStart={() => setDragIndex(index)}
                            onDragEnd={() => {
                              setDragIndex(null)
                              setDropIndex(null)
                            }}
                          >
                            <GripVerticalIcon className="size-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={index === 0}
                            onClick={() => moveItem(index, -1)}
                            aria-label="上移"
                          >
                            <ArrowUpIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={index === selectedItems.length - 1}
                            onClick={() => moveItem(index, 1)}
                            aria-label="下移"
                          >
                            <ArrowDownIcon className="size-4" />
                          </Button>
                        </div>
                      </td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </div>
    </div>
  )
}
