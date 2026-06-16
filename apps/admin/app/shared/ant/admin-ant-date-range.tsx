import { DatePicker } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { cn } from '@repo/ui'

const { RangePicker } = DatePicker

export function AdminAntDateRange({
  fromDate,
  toDate,
  onChange,
  className,
  id,
  'aria-label': ariaLabel = '日期范围',
}: {
  fromDate: string
  toDate: string
  onChange: (from: string, to: string) => void
  className?: string
  id?: string
  'aria-label'?: string
}) {
  const value: [Dayjs | null, Dayjs | null] = [
    fromDate ? dayjs(fromDate) : null,
    toDate ? dayjs(toDate) : null,
  ]

  return (
    <RangePicker
      id={id}
      aria-label={ariaLabel}
      className={cn('admin-ant-date-range', className)}
      value={value[0] || value[1] ? value : null}
      allowEmpty={[true, true]}
      placeholder={['起始日期', '结束日期']}
      onChange={(dates) => {
        onChange(
          dates?.[0]?.format('YYYY-MM-DD') ?? '',
          dates?.[1]?.format('YYYY-MM-DD') ?? '',
        )
      }}
    />
  )
}
