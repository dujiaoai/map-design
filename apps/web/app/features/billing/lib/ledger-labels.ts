const ENTRY_TYPE_LABELS: Record<string, string> = {
  adjust: '调账',
  credit: '入账',
  debit: '扣费',
  recharge: '充值',
  refund: '退款',
}

const REMARK_LABELS: Record<string, string> = {
  signup_bonus: '注册体验积分',
}

export function formatLedgerEntryType(entryType: string): string {
  return ENTRY_TYPE_LABELS[entryType] ?? entryType
}

export function formatLedgerRemark(remark: string | null | undefined): string {
  if (!remark) return '—'
  return REMARK_LABELS[remark] ?? remark
}

export function formatLedgerSignedAmount(entryType: string, amount: number): string {
  const prefix = entryType === 'debit' ? '−' : '+'
  return `${prefix}${Math.abs(amount).toLocaleString('zh-CN')}`
}
