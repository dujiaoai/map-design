import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@repo/ui'
import { Building2Icon } from 'lucide-react'
import { useId, useState } from 'react'

import { formatPoints } from '~/features/billing/lib/format-points'
import { formatPriceCents } from '~/features/billing/lib/format-price'
import { useCreateWireTransferMutation } from '~/features/billing/model/use-billing-wire-transfer-mutation'
import {
  useWireTransferPlatformAccountQuery,
  useWireTransfersQuery,
} from '~/shared/queries/billing-queries'

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function wireTransferStatusLabel(status: string) {
  if (status === 'pending') return '待审核'
  if (status === 'credited') return '已入账'
  if (status === 'rejected') return '已驳回'
  return status
}

export function BillingWireTransferPanel() {
  const companyInputId = useId()
  const emailInputId = useId()
  const amountInputId = useId()
  const pointsInputId = useId()
  const referenceInputId = useId()

  const createRequest = useCreateWireTransferMutation()
  const listQuery = useWireTransfersQuery()
  const platformAccountQuery = useWireTransferPlatformAccountQuery()
  const platformAccount = platformAccountQuery.data

  const [companyName, setCompanyName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [amountCents, setAmountCents] = useState('')
  const [points, setPoints] = useState('')
  const [bankReference, setBankReference] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    const amount = Number.parseInt(amountCents, 10)
    const pointValue = Number.parseInt(points, 10)
    if (!companyName.trim() || !contactEmail.trim()) {
      setErrorMessage('请填写企业名称与联系邮箱')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(pointValue) || pointValue <= 0) {
      setErrorMessage('汇款金额与申请积分须为正整数')
      return
    }

    try {
      const result = await createRequest.mutateAsync({
        companyName: companyName.trim(),
        contactEmail: contactEmail.trim(),
        amountCents: amount,
        points: pointValue,
        bankReference: bankReference.trim() || undefined,
      })
      setSuccessMessage(`申请已提交（${result.requestNo}），请等待平台审核入账。`)
      setCompanyName('')
      setAmountCents('')
      setPoints('')
      setBankReference('')
    } catch {
      setErrorMessage('提交失败，请稍后重试。')
    }
  }

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2Icon className="size-4 text-primary" />
          对公转账 / 企业预付
        </CardTitle>
        <CardDescription>
          {platformAccount?.enabled
            ? '请汇款至下方平台收款账户，并在附言中注明企业名称；提交申请后财务审核通过将积分入账至您的个人账户。'
            : '提交企业对公汇款信息后，平台财务审核通过后将积分入账至您的个人账户。收款账户信息请联系销售或平台运营。'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {platformAccount?.enabled ? (
          <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm">
            <p className="mb-2 font-medium text-foreground">平台收款账户</p>
            <dl className="grid gap-1.5 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs">户名</dt>
                <dd className="font-medium">{platformAccount.accountName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">开户行</dt>
                <dd className="font-medium">{platformAccount.bankName}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground text-xs">账号</dt>
                <dd className="font-mono font-medium tracking-wide">{platformAccount.accountNo}</dd>
              </div>
              {platformAccount.transferRemark ? (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground text-xs">汇款附言建议</dt>
                  <dd>{platformAccount.transferRemark}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor={companyInputId} className="text-sm font-medium">
              企业名称
            </label>
            <Input
              id={companyInputId}
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="公司全称"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor={emailInputId} className="text-sm font-medium">
              联系邮箱
            </label>
            <Input
              id={emailInputId}
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="finance@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={amountInputId} className="text-sm font-medium">
              汇款金额（分）
            </label>
            <Input
              id={amountInputId}
              type="number"
              min={1}
              value={amountCents}
              onChange={(event) => setAmountCents(event.target.value)}
              placeholder="100000 = ¥1000.00"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={pointsInputId} className="text-sm font-medium">
              申请积分
            </label>
            <Input
              id={pointsInputId}
              type="number"
              min={1}
              value={points}
              onChange={(event) => setPoints(event.target.value)}
              placeholder="10000"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor={referenceInputId} className="text-sm font-medium">
              汇款备注 / 流水号（可选）
            </label>
            <Input
              id={referenceInputId}
              value={bankReference}
              onChange={(event) => setBankReference(event.target.value)}
              placeholder="银行转账附言或流水号"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={createRequest.isPending}>
              {createRequest.isPending ? '提交中…' : '提交预付申请'}
            </Button>
          </div>
        </form>

        {amountCents && Number.parseInt(amountCents, 10) > 0 ? (
          <p className="text-muted-foreground text-xs">
            约合 {formatPriceCents(Number.parseInt(amountCents, 10))}
            {points ? ` · 申请 ${formatPoints(Number.parseInt(points, 10) || 0)} 点` : null}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}

        {listQuery.data && listQuery.data.items.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-border/60">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">单号</th>
                  <th className="px-3 py-2 font-medium">积分</th>
                  <th className="px-3 py-2 font-medium">状态</th>
                  <th className="px-3 py-2 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {listQuery.data.items.map((item) => (
                  <tr key={item.id} className="border-t border-border/50">
                    <td className="px-3 py-2 font-mono text-xs">{item.requestNo}</td>
                    <td className="px-3 py-2">{formatPoints(item.points)}</td>
                    <td className="px-3 py-2">{wireTransferStatusLabel(item.status)}</td>
                    <td className="text-muted-foreground px-3 py-2 whitespace-nowrap">
                      {item.createdAt ? dateFormatter.format(new Date(item.createdAt)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
