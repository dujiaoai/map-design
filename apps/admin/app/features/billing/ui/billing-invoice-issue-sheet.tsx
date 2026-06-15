import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  toast,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'

import type { AdminInvoice } from '~/features/billing/lib/billing-admin-api'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'

function invoiceTypeLabel(type: string) {
  if (type === 'personal') return '个人'
  if (type === 'enterprise') return '企业'
  return type
}

export function BillingInvoiceIssueSheet({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: AdminInvoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const pdfUrlInputId = useId()
  const [pdfUrl, setPdfUrl] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPdfUrl('')
      setValidationError(null)
    }
  }, [open, invoice?.id])

  const mutation = useMutation({
    mutationFn: async (payload: { invoiceId: string; pdfUrl?: string }) => {
      await billingAdminApi.post(`/invoices/${encodeURIComponent(payload.invoiceId)}/issue`, {
        ...(payload.pdfUrl ? { pdfUrl: payload.pdfUrl } : {}),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
      toast.success('发票已标记为已开具')
      onOpenChange(false)
    },
  })

  const formError =
    validationError ?? (mutation.error ? formatAdminApiError(mutation.error) : null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">标记已开具</SheetTitle>
          <SheetDescription>
            可选填写 PDF 下载地址；留空则使用后端占位路径。
          </SheetDescription>
        </SheetHeader>

        {invoice ? (
          <dl className="space-y-3 border-y border-border/60 px-4 py-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">订单号</dt>
              <dd>
                <AdminIdCell value={invoice.orderNo} label="订单号" />
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">抬头</dt>
              <dd className="max-w-[220px] truncate font-medium">{invoice.title}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">类型</dt>
              <dd>{invoiceTypeLabel(invoice.invoiceType)}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">金额</dt>
              <dd className="font-medium tabular-nums">
                {formatBillingPrice(invoice.amountCents, invoice.currency)}
              </dd>
            </div>
          </dl>
        ) : null}

        <form
          className="flex flex-1 flex-col gap-4 px-4"
          onSubmit={(event) => {
            event.preventDefault()
            setValidationError(null)
            if (!invoice) {
              setValidationError('未选择发票申请')
              return
            }
            const trimmed = pdfUrl.trim()
            mutation.mutate({
              invoiceId: invoice.id,
              pdfUrl: trimmed || undefined,
            })
          }}
        >
          <AdminField label="PDF 地址（可选）" htmlFor={pdfUrlInputId}>
            <Input
              id={pdfUrlInputId}
              value={pdfUrl}
              onChange={(event) => setPdfUrl(event.target.value)}
              placeholder="https://…/invoice.pdf"
            />
          </AdminField>
          <AdminFormError message={formError} />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={!invoice || mutation.isPending}>
              {mutation.isPending ? '提交中…' : '确认已开具'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
