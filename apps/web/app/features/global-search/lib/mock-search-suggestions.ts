export type GlobalSearchSuggestionKind = 'place' | 'coordinate' | 'feature' | 'hint'

export interface GlobalSearchSuggestion {
  id: string
  kind: GlobalSearchSuggestionKind
  title: string
  subtitle?: string
  query: string
}

const MOCK_PLACES: Omit<GlobalSearchSuggestion, 'id'>[] = [
  { kind: 'place', title: '杭州市西湖区', subtitle: '行政区划', query: '杭州市西湖区' },
  { kind: 'place', title: '西湖风景名胜区', subtitle: '兴趣点', query: '西湖风景名胜区' },
  { kind: 'place', title: '萧山国际机场', subtitle: '交通设施', query: '萧山国际机场' },
  { kind: 'place', title: '钱江新城', subtitle: '商圈', query: '钱江新城' },
]

const MOCK_FEATURES: Omit<GlobalSearchSuggestion, 'id'>[] = [
  { kind: 'feature', title: '飞行禁飞区-001', subtitle: '空域要素', query: '飞行禁飞区-001' },
  { kind: 'feature', title: '巡检航线-A12', subtitle: '航线要素', query: '巡检航线-A12' },
  { kind: 'feature', title: '机库-HZ-03', subtitle: '设备点位', query: '机库-HZ-03' },
]

const EMPTY_HINTS: GlobalSearchSuggestion[] = [
  {
    id: 'hint-place',
    kind: 'hint',
    title: '搜索地点或兴趣点',
    subtitle: '例如：西湖风景名胜区',
    query: '',
  },
  {
    id: 'hint-coordinate',
    kind: 'hint',
    title: '输入经纬度坐标',
    subtitle: '例如：120.15, 30.28',
    query: '',
  },
  {
    id: 'hint-feature',
    kind: 'hint',
    title: '检索地图要素',
    subtitle: '例如：巡检航线、禁飞区',
    query: '',
  },
]

const COORDINATE_PATTERN =
  /^(-?\d{1,3}(?:\.\d+)?)\s*[,，]\s*(-?\d{1,3}(?:\.\d+)?)$/

export function parseCoordinateQuery(query: string): { lat: number; lng: number } | null {
  const trimmed = query.trim()
  const match = trimmed.match(COORDINATE_PATTERN)
  if (!match) {
    return null
  }

  const first = Number.parseFloat(match[1]!)
  const second = Number.parseFloat(match[2]!)
  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null
  }

  const looksLikeLngLat = Math.abs(first) > 90 || Math.abs(second) <= 90
  const lng = looksLikeLngLat ? first : second
  const lat = looksLikeLngLat ? second : first

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null
  }

  return { lat, lng }
}

function withId(item: Omit<GlobalSearchSuggestion, 'id'>, id: string): GlobalSearchSuggestion {
  return { ...item, id }
}

function filterByQuery(items: Omit<GlobalSearchSuggestion, 'id'>[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return []
  }

  return items.filter((item) => {
    const haystack = `${item.title} ${item.subtitle ?? ''}`.toLowerCase()
    return haystack.includes(normalized)
  })
}

export function buildSearchSuggestions(query: string, limit = 6): GlobalSearchSuggestion[] {
  const trimmed = query.trim()
  if (!trimmed) {
    return EMPTY_HINTS
  }

  const suggestions: GlobalSearchSuggestion[] = []
  const coordinate = parseCoordinateQuery(trimmed)

  if (coordinate) {
    suggestions.push({
      id: 'coordinate-match',
      kind: 'coordinate',
      title: `坐标 ${coordinate.lng.toFixed(5)}, ${coordinate.lat.toFixed(5)}`,
      subtitle: '定位至该坐标',
      query: `${coordinate.lng}, ${coordinate.lat}`,
    })
  }

  const places = filterByQuery(MOCK_PLACES, trimmed).map((item, index) =>
    withId(item, `place-${index}`),
  )
  const features = filterByQuery(MOCK_FEATURES, trimmed).map((item, index) =>
    withId(item, `feature-${index}`),
  )

  for (const item of [...places, ...features]) {
    if (suggestions.length >= limit) {
      break
    }
    if (suggestions.some((existing) => existing.title === item.title)) {
      continue
    }
    suggestions.push(item)
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: 'no-match',
      kind: 'hint',
      title: `未找到「${trimmed}」的快捷结果`,
      subtitle: '按 Enter 在右侧面板查看全部检索',
      query: trimmed,
    })
  }

  return suggestions.slice(0, limit)
}
