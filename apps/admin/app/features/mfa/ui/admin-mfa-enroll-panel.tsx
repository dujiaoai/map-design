import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Label } from '@repo/ui'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  disableAdminTotp,
  enrollAdminTotp,
  verifyAdminTotp,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import {
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminFlagBadge } from '~/shared/ui/admin-status-pill'
import { ShieldIcon } from 'lucide-react'

interface AdminMfaEnrollPanelProps {
  enrolled: boolean
}

export function AdminMfaEnrollPanel({ enrolled }: AdminMfaEnrollPanelProps) {
  const queryClient = useQueryClient()
  const [enrollData, setEnrollData] = useState<{
    secret: string
    qrCodeDataUrl: string
  } | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [disableCode, setDisableCode] = useState('')

  const enrollMutation = useMutation({
    mutationFn: enrollAdminTotp,
    onSuccess: (data) => {
      setEnrollData({ secret: data.secret, qrCodeDataUrl: data.qrCodeDataUrl })
      toast.success('已生成 TOTP 密钥，请用验证器扫码后输入 6 位码')
    },
    onError: () => toast.error('无法开始 TOTP 注册'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => verifyAdminTotp(verifyCode.trim()),
    onSuccess: async () => {
      setEnrollData(null)
      setVerifyCode('')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.mfaStatus })
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.systemFlags })
      toast.success('TOTP 已绑定')
    },
    onError: () => toast.error('验证码无效或 enrollment 已过期'),
  })

  const disableMutation = useMutation({
    mutationFn: () => disableAdminTotp(disableCode.trim()),
    onSuccess: async () => {
      setDisableCode('')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.mfaStatus })
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.systemFlags })
      toast.success('TOTP 已注销')
    },
    onError: () => toast.error('验证码无效'),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={ShieldIcon}
        title="TOTP 双因素认证"
        description="平台管理员可选绑定；绑定后登录须输入 6 位动态码。"
      />
      <div className="space-y-4 px-4 py-4 md:px-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">当前账号</span>
          <AdminFlagBadge enabled={enrolled} label={enrolled ? '已绑定' : '未绑定'} />
        </div>

        {!enrolled ? (
          <>
            {!enrollData ? (
              <Button
                type="button"
                disabled={enrollMutation.isPending}
                onClick={() => {
                  void enrollMutation.mutate()
                }}
              >
                {enrollMutation.isPending ? '生成中…' : '开始绑定 TOTP'}
              </Button>
            ) : (
              <div className="space-y-4 rounded-lg border border-border/60 p-4">
                <img
                  src={enrollData.qrCodeDataUrl}
                  alt="TOTP QR code"
                  className="mx-auto size-40 rounded-md bg-white p-2"
                />
                <div className="space-y-1.5">
                  <Label htmlFor="totp-secret">手动输入密钥</Label>
                  <Input id="totp-secret" readOnly value={enrollData.secret} className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="totp-verify">验证码</Label>
                  <Input
                    id="totp-verify"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(event) => setVerifyCode(event.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <Button
                  type="button"
                  disabled={verifyCode.length !== 6 || verifyMutation.isPending}
                  onClick={() => {
                    void verifyMutation.mutate()
                  }}
                >
                  {verifyMutation.isPending ? '验证中…' : '确认绑定'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3 rounded-lg border border-border/60 p-4">
            <p className="text-sm text-muted-foreground">注销须输入当前验证器 6 位码。</p>
            <div className="space-y-1.5">
              <Label htmlFor="totp-disable">验证码</Label>
              <Input
                id="totp-disable"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={disableCode}
                onChange={(event) => setDisableCode(event.target.value.replace(/\D/g, ''))}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={disableCode.length !== 6 || disableMutation.isPending}
              onClick={() => {
                void disableMutation.mutate()
              }}
            >
              {disableMutation.isPending ? '注销中…' : '注销 TOTP'}
            </Button>
          </div>
        )}
      </div>
    </AdminPanel>
  )
}
