export function formatBillingPrice(cents: number, currency: string) {
  if (currency === 'CNY') {
    return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }
  return `${cents} ${currency}`
}

export const LEDGER_ENTRY_TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'recharge', label: '充值' },
  { value: 'adjust', label: '调账' },
  { value: 'debit', label: '扣费' },
  { value: 'refund', label: '退款' },
  { value: 'transfer_in', label: '划入' },
  { value: 'transfer_out', label: '划出' },
] as const

const LEDGER_ENTRY_TYPE_LABELS = Object.fromEntries(
  LEDGER_ENTRY_TYPE_OPTIONS.filter((option) => option.value !== 'all').map((option) => [
    option.value,
    option.label,
  ]),
) as Record<string, string>

export function formatLedgerEntryType(entryType: string) {
  return LEDGER_ENTRY_TYPE_LABELS[entryType] ?? entryType
}

export function formatLedgerAmount(amount: number) {
  if (amount > 0) return `+${amount}`
  return String(amount)
}
