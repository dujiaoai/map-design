import type { LedgerEntry } from '@repo/billing-client'

export function parseRechargeOrderNoFromRemark(
  remark: string | null | undefined,
): string | null {
  if (!remark?.startsWith('recharge:')) return null
  const orderNo = remark.slice('recharge:'.length).trim()
  return orderNo || null
}

export function extractRechargeOrderNosFromLedger(items: LedgerEntry[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    if (item.entryType !== 'recharge') continue
    const orderNo = parseRechargeOrderNoFromRemark(item.remark)
    if (orderNo && !seen.has(orderNo)) {
      seen.add(orderNo)
      result.push(orderNo)
    }
  }
  return result
}
