export type MapControlImageryPeriodId = string

export type MapControlImageryPeriod = {
  id: MapControlImageryPeriodId
  /** 期数代号，如 2025-06 */
  label: string
  /** 采集说明 */
  caption: string
  isLatest?: boolean
}

/** mock 正射期数列表（对齐 ortho-imagery-plugin switchPeriod 语义） */
export const MOCK_IMAGERY_PERIODS: MapControlImageryPeriod[] = [
  {
    id: 'ortho-2025-06',
    label: '2025-06',
    caption: '2025年6月正射',
    isLatest: true,
  },
  {
    id: 'ortho-2025-03',
    label: '2025-03',
    caption: '2025年3月正射',
  },
  {
    id: 'ortho-2024-12',
    label: '2024-12',
    caption: '2024年12月正射',
  },
  {
    id: 'ortho-2024-09',
    label: '2024-09',
    caption: '2024年9月正射',
  },
  {
    id: 'ortho-2024-06',
    label: '2024-06',
    caption: '2024年6月正射',
  },
]

export function resolveDefaultImageryPeriodId(): MapControlImageryPeriodId | null {
  const latest = MOCK_IMAGERY_PERIODS.find((period) => period.isLatest)
  return latest?.id ?? MOCK_IMAGERY_PERIODS[0]?.id ?? null
}

export function findImageryPeriod(
  periodId: MapControlImageryPeriodId | null,
): MapControlImageryPeriod | undefined {
  if (!periodId) {
    return undefined
  }
  return MOCK_IMAGERY_PERIODS.find((period) => period.id === periodId)
}
