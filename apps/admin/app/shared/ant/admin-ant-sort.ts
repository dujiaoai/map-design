import type { SortOrder } from 'antd/es/table/interface'

import type { AdminSortDirection, AdminSortState } from '~/shared/hooks/use-admin-table-sort'

export function adminAntSortOrder<K extends string>(
  sort: AdminSortState<K> | null,
  key: K,
): SortOrder | null {
  if (!sort || sort.key !== key) return null
  return sort.direction === 'asc' ? 'ascend' : 'descend'
}
