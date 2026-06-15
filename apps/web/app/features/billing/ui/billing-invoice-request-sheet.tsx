import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { useEffect, useId, useState } from 'react'

import { useCreateInvoiceMutation } from '~/features/billing/model/use-billing-invoice-mutations'

type InvoiceRequestSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderOptions: string[]
  defaultOrderNo?: string
  onSuccess?: () => void
}

export function BillingInvoiceRequestSheet({
  open,
  onOpenChange,
  orderOptions,
  defaultOrderNo,
  onSuccess,
}: InvoiceRequestSheetProps) {
  const orderSelectId = useId()
  const titleInputId = useId()
  const taxNoInputId = useId()
  const emailInputId = useId()

  const createInvoice = useCreateInvoiceMutation()
  const [orderNo, setOrderNo] = useState('')
  const [invoiceType, setInvoiceType] = useState<'personal' | 'enterprise'>('personal')
  const [title, setTitle] = useState('')
  const [taxNo, setTaxNo] = useState('')
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setOrderNo(defaultOrderNo ?? orderOptions[0] ?? '')
    setErrorMessage(null)
  }, [open, defaultOrderNo, orderOptions])

  const orderSelectValue = orderNo || orderOptions[0] || undefined

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErrorMessage(null)

    if (!orderNo.trim()) {
      setErrorMessage('请选择充值订单')
      return
    }
    if (!title.trim()) {
      setErrorMessage('请填写发票抬头')
      return
    }
    if (!email.trim()) {
      setErrorMessage('请填写接收邮箱')
      return
    }
    if (invoiceType === 'enterprise' && !taxNo.trim()) {
      setErrorMessage('企业发票需填写纳税人识别号')
      return
    }

    try {
      await createInvoice.mutateAsync({
        orderNo: orderNo.trim(),
        invoiceType,
        title: title.trim(),
        taxNo: invoiceType === 'enterprise' ? taxNo.trim() : undefined,
        email: email.trim(),
      })
      onOpenChange(false)
      onSuccess?.()
    } catch {
      setErrorMessage('提交失败，请确认订单已支付且尚未申请过发票。')
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>申请发票</DrawerTitle>
          <DrawerDescription>
            仅支持已支付充值订单；每个订单仅可申请一次，平台审核后将发送至邮箱。
          </DrawerDescription>
        </DrawerHeader>

        <form className="flex flex-1 flex-col overflow-y-auto px-4" onSubmit={handleSubmit}>
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor={orderSelectId}>充值订单</Label>
              {orderOptions.length > 0 ? (
                <Select
                  value={orderSelectValue}
                  onValueChange={(value) => setOrderNo(value ?? '')}
                >
                  <SelectTrigger id={orderSelectId}>
                    <SelectValue placeholder="选择订单" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={orderSelectId}
                  value={orderNo}
                  onChange={(event) => setOrderNo(event.target.value)}
                  placeholder="RO-..."
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>发票类型</Label>
              <Select
                value={invoiceType}
                onValueChange={(value) => setInvoiceType(value as 'personal' | 'enterprise')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">个人</SelectItem>
                  <SelectItem value="enterprise">企业</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={titleInputId}>发票抬头</Label>
              <Input
                id={titleInputId}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={invoiceType === 'personal' ? '姓名' : '公司全称'}
              />
            </div>

            {invoiceType === 'enterprise' ? (
              <div className="space-y-2">
                <Label htmlFor={taxNoInputId}>纳税人识别号</Label>
                <Input
                  id={taxNoInputId}
                  value={taxNo}
                  onChange={(event) => setTaxNo(event.target.value)}
                  placeholder="统一社会信用代码 / 税号"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor={emailInputId}>接收邮箱</Label>
              <Input
                id={emailInputId}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="finance@example.com"
              />
            </div>

            {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
          </div>

          <DrawerFooter className="px-0">
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? '提交中…' : '提交申请'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={createInvoice.isPending}
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
