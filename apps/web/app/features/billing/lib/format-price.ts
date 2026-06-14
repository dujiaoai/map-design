const cnyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
})

export function formatPriceCents(cents: number): string {
  return cnyFormatter.format(cents / 100)
}
