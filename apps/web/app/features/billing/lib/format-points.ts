const pointsFormatter = new Intl.NumberFormat('zh-CN')

export function formatPoints(value: number): string {
  return pointsFormatter.format(value)
}
