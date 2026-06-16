import type { TableProps } from 'antd'

export function createAdminAntSortHandler<K extends string>(
  toggleSort: (key: K) => void,
): NonNullable<TableProps['onChange']> {
  return (_pagination, _filters, sorter) => {
    if (Array.isArray(sorter) || !sorter.columnKey) return
    toggleSort(String(sorter.columnKey) as K)
  }
}

/** billing 等 API 使用 0-based page */
export function adminAntZeroBasedPagination(
  page: number,
  pageSize: number,
  total: number,
  onPageChange: (page: number) => void,
) {
  return {
    current: page + 1,
    pageSize,
    total,
    onChange: (nextPage: number) => onPageChange(nextPage - 1),
  }
}
