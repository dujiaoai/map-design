import { DatePicker } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { cn } from '@repo/ui'

export function AdminAntDate({
  value,
  onChange,
  className,
  id,
  placeholder = '选择日期',
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  id?: string
  placeholder?: string
  'aria-label'?: string
}) {
  const parsed: Dayjs | null = value ? dayjs(value) : null

  return (
    <DatePicker
      id={id}
      aria-label={ariaLabel}
      className={cn('admin-ant-date', className)}
      value={parsed}
      placeholder={placeholder}
      onChange={(date) => onChange(date?.format('YYYY-MM-DD') ?? '')}
    />
  )
}
