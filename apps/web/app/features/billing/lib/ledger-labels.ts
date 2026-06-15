const ENTRY_TYPE_LABELS: Record<string, string> = {
  adjust: '调账',
  credit: '入账',
  coupon: '优惠券',
  debit: '扣费',
  recharge: '充值',
  refund: '退款',
  transfer_in: '划拨收入',
  transfer_out: '划拨支出',
}

const REMARK_LABELS: Record<string, string> = {
  signup_bonus: '注册体验积分',
}

export function formatLedgerEntryType(entryType: string): string {
  return ENTRY_TYPE_LABELS[entryType] ?? entryType
}

export function formatLedgerRemark(remark: string | null | undefined): string {
  if (!remark) return '—'
  if (REMARK_LABELS[remark]) return REMARK_LABELS[remark]
  if (remark.startsWith('recharge:')) return '在线充值'
  if (remark.startsWith('coupon:')) return `优惠券 ${remark.slice('coupon:'.length)}`
  return remark
}

export function formatLedgerSignedAmount(entryType: string, amount: number): string {
  if (entryType === 'transfer_out' || entryType === 'debit') {
    return `−${Math.abs(amount).toLocaleString('zh-CN')}`
  }
  const prefix = amount < 0 ? '−' : '+'
  return `${prefix}${Math.abs(amount).toLocaleString('zh-CN')}`
}
