import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@repo/ui'
import { FileTextIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { formatInvoiceStatus, formatInvoiceType } from '~/features/billing/lib/invoice-labels'
import { formatPriceCents } from '~/features/billing/lib/format-price'
import { extractRechargeOrderNosFromLedger } from '~/features/billing/lib/recharge-order-from-ledger'
import { BillingInvoiceRequestSheet } from '~/features/billing/ui/billing-invoice-request-sheet'
import {
  useInvoicesQuery,
  useRechargeLedgerOrdersQuery,
} from '~/shared/queries/billing-queries'

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function InvoicePdfLink({ pdfUrl }: { pdfUrl: string }) {
  const isExternal = /^https?:\/\//i.test(pdfUrl)
  if (isExternal) {
    return (
      <a
        href={pdfUrl}
        target="_blank"
        rel="noreferrer"
        className="text-primary text-xs underline-offset-2 hover:underline"
      >
        下载 PDF
      </a>
    )
  }
  return <p className="text-muted-foreground font-mono text-xs">{pdfUrl}</p>
}

export function BillingInvoicesPanel({
  requestOrderNo,
  onClearRequestOrderNo,
}: {
  requestOrderNo?: string | null
  onClearRequestOrderNo?: () => void
}) {
  const invoicesQuery = useInvoicesQuery()
  const ledgerQuery = useRechargeLedgerOrdersQuery()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [defaultOrderNo, setDefaultOrderNo] = useState<string | undefined>()

  const rechargeOrderOptions = useMemo(() => {
    if (!ledgerQuery.data) return []
    return extractRechargeOrderNosFromLedger(ledgerQuery.data)
  }, [ledgerQuery.data])

  const invoicedOrderNos = useMemo(() => {
    return new Set(invoicesQuery.data?.items.map((item) => item.orderNo) ?? [])
  }, [invoicesQuery.data])

  const availableOrderOptions = useMemo(
    () => rechargeOrderOptions.filter((orderNo) => !invoicedOrderNos.has(orderNo)),
    [rechargeOrderOptions, invoicedOrderNos],
  )

  useEffect(() => {
    if (!requestOrderNo) return
    setDefaultOrderNo(requestOrderNo)
    setSheetOpen(true)
    onClearRequestOrderNo?.()
  }, [requestOrderNo, onClearRequestOrderNo])

  function openSheet(orderNo?: string) {
    setDefaultOrderNo(orderNo)
    setSheetOpen(true)
  }

  const isLoading = invoicesQuery.isPending || ledgerQuery.isPending
  const loadError = invoicesQuery.isError || ledgerQuery.isError

  return (
    <>
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4 text-primary" />
              充值发票
            </CardTitle>
            <CardDescription>
              为已支付充值订单申请电子发票；申请记录可在下方查看处理进度。
            </CardDescription>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => openSheet()}>
            申请发票
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableOrderOptions.length > 0 ? (
            <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-2">
              <p className="text-sm font-medium">可开票充值记录</p>
              <ul className="space-y-2">
                {availableOrderOptions.slice(0, 5).map((orderNo) => (
                  <li
                    key={orderNo}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="font-mono text-xs">{orderNo}</span>
                    <Button type="button" size="sm" variant="ghost" onClick={() => openSheet(orderNo)}>
                      申请发票
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : loadError ? (
            <p className="text-muted-foreground text-sm">暂时无法加载发票记录，请稍后重试。</p>
          ) : invoicesQuery.data.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">暂无发票申请。</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border/60">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">订单号</th>
                    <th className="px-3 py-2 font-medium">类型 / 抬头</th>
                    <th className="px-3 py-2 font-medium">金额</th>
                    <th className="px-3 py-2 font-medium">状态</th>
                    <th className="px-3 py-2 font-medium">申请时间</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesQuery.data.items.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-border/50">
                      <td className="px-3 py-2 font-mono text-xs">{invoice.orderNo}</td>
                      <td className="px-3 py-2">
                        <p>{formatInvoiceType(invoice.invoiceType)}</p>
                        <p className="text-muted-foreground text-xs">{invoice.title}</p>
                      </td>
                      <td className="px-3 py-2">
                        {formatPriceCents(invoice.amountCents)}
                      </td>
                      <td className="px-3 py-2">
                        <p>{formatInvoiceStatus(invoice.status)}</p>
                        {invoice.adminRemark ? (
                          <p className="text-muted-foreground text-xs">{invoice.adminRemark}</p>
                        ) : null}
                        {invoice.status === 'issued' && invoice.pdfUrl ? (
                          <div className="mt-1">
                            <InvoicePdfLink pdfUrl={invoice.pdfUrl} />
                          </div>
                        ) : null}
                      </td>
                      <td className="text-muted-foreground px-3 py-2 whitespace-nowrap">
                        {invoice.createdAt
                          ? dateFormatter.format(new Date(invoice.createdAt))
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <BillingInvoiceRequestSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        orderOptions={availableOrderOptions.length > 0 ? availableOrderOptions : rechargeOrderOptions}
        defaultOrderNo={defaultOrderNo}
      />
    </>
  )
}
