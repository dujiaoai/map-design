import { Table, type TableProps } from 'antd'
import { cn } from '@repo/ui'

export type AdminAntTableProps<T extends object> = TableProps<T> & {
  /** 嵌入 AdminPanel 时使用，去掉外层圆角冲突 */
  embedded?: boolean
}

export function AdminAntTable<T extends object>({
  className,
  embedded = true,
  size = 'middle',
  pagination,
  ...props
}: AdminAntTableProps<T>) {
  const paginationConfig =
    pagination === false
      ? false
      : {
          showSizeChanger: false,
          showTotal: (total: number, range: [number, number]) =>
            total === 0 ? '无数据' : `第 ${range[0]}–${range[1]} 条，共 ${total} 条`,
          ...pagination,
        }

  return (
    <Table<T>
      {...props}
      size={size}
      className={cn('admin-ant-table', embedded && 'rounded-none border-0', className)}
      pagination={paginationConfig}
    />
  )
}
