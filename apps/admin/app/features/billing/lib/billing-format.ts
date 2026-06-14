export function formatBillingPrice(cents: number, currency: string) {
  if (currency === 'CNY') {
    return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }
  return `${cents} ${currency}`
}
