const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  issued: '已开具',
  rejected: '已驳回',
}

const INVOICE_TYPE_LABELS: Record<string, string> = {
  personal: '个人',
  enterprise: '企业',
}

export function formatInvoiceStatus(status: string): string {
  return INVOICE_STATUS_LABELS[status] ?? status
}

export function formatInvoiceType(type: string): string {
  return INVOICE_TYPE_LABELS[type] ?? type
}
