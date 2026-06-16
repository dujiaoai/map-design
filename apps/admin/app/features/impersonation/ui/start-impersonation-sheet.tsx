import { Button, Input, Label, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, cn } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { fetchAdminMfaStatus, startImpersonation } from '~/shared/api/admin-api'

import { applyLoginResponse } from '../lib/apply-login-response'

export function StartImpersonationSheet({
  tenantId,
  tenantLabel,
  open,
  onOpenChange,
}: {
  tenantId: string
  tenantLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [pending, setPending] = useState(false)

  const mfaQuery = useQuery({
    queryKey: ['admin', 'mfa', 'status'],
    queryFn: fetchAdminMfaStatus,
    enabled: open,
  })

  const totpRequired = mfaQuery.data?.enrolled === true

  async function handleSubmit() {
    const trimmed = reason.trim()
    if (!trimmed) {
      toast.error('请填写代操作原因')
      return
    }
    if (totpRequired && totpCode.length !== 6) {
      toast.error('请输入验证器 6 位动态码')
      return
    }
    setPending(true)
    try {
      const response = await startImpersonation({
        tenantId,
        reason: trimmed,
        ...(totpRequired ? { totpCode } : {}),
      })
      applyLoginResponse(response)
      toast.success(`已开始代操作：${tenantLabel}`)
      setReason('')
      setTotpCode('')
      onOpenChange(false)
    } catch {
      toast.error('开始代操作失败，请重试')
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>租户代操作</SheetTitle>
        </SheetHeader>
        <p className="text-sm text-muted-foreground">
          将以 <span className="font-medium text-foreground">{tenantLabel}</span>{' '}
          的租户上下文签发新会话，操作写入审计日志。
        </p>
        <div className="space-y-2">
          <Label htmlFor="impersonation-reason">原因</Label>
          <textarea
            id="impersonation-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="例如：协助客户排查成员权限"
            rows={4}
            className={cn(
              'border-input bg-background ring-offset-background placeholder:text-muted-foreground',
              'flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          />
        </div>
        {totpRequired ? (
          <div className="space-y-2">
            <Label htmlFor="impersonation-totp">验证器动态码</Label>
            <Input
              id="impersonation-totp"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={totpCode}
              onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, ''))}
            />
            <p className="text-xs text-muted-foreground">已绑定 TOTP，代操作前须二次验证。</p>
          </div>
        ) : null}
        <SheetFooter className="mt-auto gap-2 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            disabled={pending || (totpRequired && totpCode.length !== 6)}
            onClick={() => void handleSubmit()}
          >
            开始代操作
          </Button>
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            取消
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
