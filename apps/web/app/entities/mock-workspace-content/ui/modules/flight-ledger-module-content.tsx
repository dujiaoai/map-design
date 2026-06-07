import { cn } from '@repo/ui'
import { FilterIcon, PlaneIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

type FlightStatus = 'completed' | 'in_progress' | 'planned'

interface FlightRow {
  id: string
  route: string
  pilot: string
  status: FlightStatus
  date: string
  duration: string
}

const MOCK_FLIGHTS: FlightRow[] = [
  {
    id: 'FL-240601',
    route: '西湖环线 A',
    pilot: '张明',
    status: 'completed',
    date: '2025-06-05',
    duration: '42 分',
  },
  {
    id: 'FL-240602',
    route: '钱江新城巡检',
    pilot: '李华',
    status: 'in_progress',
    date: '2025-06-06',
    duration: '—',
  },
  {
    id: 'FL-240603',
    route: '萧山机场净空',
    pilot: '王芳',
    status: 'planned',
    date: '2025-06-07',
    duration: '—',
  },
  {
    id: 'FL-240604',
    route: '运河东段',
    pilot: '张明',
    status: 'completed',
    date: '2025-06-04',
    duration: '38 分',
  },
  {
    id: 'FL-240605',
    route: '未来科技城',
    pilot: '赵强',
    status: 'completed',
    date: '2025-06-03',
    duration: '51 分',
  },
  {
    id: 'FL-240606',
    route: '良渚遗址巡查',
    pilot: '李华',
    status: 'planned',
    date: '2025-06-08',
    duration: '—',
  },
  {
    id: 'FL-240607',
    route: '千岛湖东岸',
    pilot: '王芳',
    status: 'completed',
    date: '2025-06-02',
    duration: '67 分',
  },
  {
    id: 'FL-240608',
    route: '临安城区巡检',
    pilot: '张明',
    status: 'in_progress',
    date: '2025-06-06',
    duration: '—',
  },
]

const STATUS_LABEL: Record<FlightStatus, string> = {
  completed: '已完成',
  in_progress: '进行中',
  planned: '计划中',
}

const STATUS_CLASS: Record<FlightStatus, string> = {
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  in_progress: 'bg-primary/15 text-brand-deep dark:text-brand-light',
  planned: 'bg-muted text-muted-foreground',
}

const FILTER_OPTIONS = ['全部', '进行中', '已完成', '计划中'] as const

export function FlightLedgerModuleContent(_props: MockModuleContentProps) {
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]>('全部')

  const rows = useMemo(() => {
    if (filter === '全部') return MOCK_FLIGHTS
    const statusMap: Record<string, FlightStatus> = {
      进行中: 'in_progress',
      已完成: 'completed',
      计划中: 'planned',
    }
    const status = statusMap[filter]
    return MOCK_FLIGHTS.filter((row) => row.status === status)
  }, [filter])

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="筛选">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                filter === option
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </MockContentSection>

      <MockContentSection title="飞行记录">
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground dark:bg-white/5">
              <tr>
                <th className="px-2 py-2 font-medium">编号</th>
                <th className="px-2 py-2 font-medium">航线</th>
                <th className="hidden px-2 py-2 font-medium sm:table-cell">飞手</th>
                <th className="px-2 py-2 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-border hover:bg-muted/30 border-t transition-colors dark:border-white/10"
                >
                  <td className="cc-mono text-muted-foreground px-2 py-2 tabular-nums">{row.id}</td>
                  <td className="px-2 py-2">
                    <p className="text-foreground font-medium">{row.route}</p>
                    <p className="text-muted-foreground">
                      {row.date} · {row.duration}
                    </p>
                  </td>
                  <td className="hidden px-2 py-2 sm:table-cell">{row.pilot}</td>
                  <td className="px-2 py-2">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium',
                        STATUS_CLASS[row.status],
                      )}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MockContentSection>

      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <FilterIcon className="size-3.5" aria-hidden />
        共 {rows.length} 条记录 · 点击行可在地图定位航线
      </p>
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <PlaneIcon className="size-3.5" aria-hidden />
        数据为演示 mock，接入台账 API 后自动同步
      </p>
    </div>
  )
}
