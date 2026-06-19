import { env } from '~/shared/config/env'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, Checkbox, Input, Label, Textarea, toast } from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DownloadIcon, RefreshCwIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { AdminTenantSamlConfig } from '~/entities/tenant/model'
import {
  importTenantSamlMetadata,
  patchTenantSamlConfig,
  rotateTenantSamlSpCertificate,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'
import { ShieldIcon } from 'lucide-react'

function certExpiryHint(expiresAt: number | null | undefined): { label: string; warn: boolean } {
  if (!expiresAt) return { label: '未配置', warn: false }
  const days = (expiresAt - Date.now()) / 86_400_000
  const label = formatAdminDate(expiresAt)
  return { label, warn: days <= 30 }
}

const schema = z.object({
  enabled: z.boolean(),
  metadataSyncEnabled: z.boolean(),
  entityId: z.string().max(512),
  ssoUrl: z.string().max(1024),
  acsUrl: z.string().max(1024),
  spEntityId: z.string().max(512),
  metadataUrl: z.string().max(1024),
  certificatePem: z.string().max(8192),
})

type FormValues = z.infer<typeof schema>

export function TenantSamlConfigForm({
  tenantId,
  tenantSlug,
  config,
  readOnly,
}: {
  tenantId: string
  tenantSlug: string
  config: AdminTenantSamlConfig
  readOnly: boolean
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      enabled: false,
      metadataSyncEnabled: false,
      entityId: '',
      ssoUrl: '',
      acsUrl: '',
      spEntityId: '',
      metadataUrl: '',
      certificatePem: '',
    },
  })

  const enabled = watch('enabled')
  const metadataSyncEnabled = watch('metadataSyncEnabled')
  const idpCert = certExpiryHint(config.idpCertExpiresAt)
  const spCert = certExpiryHint(config.spCertificateExpiresAt)

  useEffect(() => {
    reset({
      enabled: config.enabled,
      metadataSyncEnabled: config.metadataSyncEnabled ?? false,
      entityId: config.entityId ?? '',
      ssoUrl: config.ssoUrl ?? '',
      acsUrl: config.acsUrl ?? '',
      spEntityId: config.spEntityId ?? '',
      metadataUrl: config.metadataUrl ?? '',
      certificatePem: '',
    })
  }, [config, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: Parameters<typeof patchTenantSamlConfig>[1] = {
        enabled: values.enabled,
        metadataSyncEnabled: values.metadataSyncEnabled,
      }
      const entityId = values.entityId.trim()
      const ssoUrl = values.ssoUrl.trim()
      const acsUrl = values.acsUrl.trim()
      const spEntityId = values.spEntityId.trim()
      const metadataUrl = values.metadataUrl.trim()
      const certificatePem = values.certificatePem.trim()
      if (entityId) payload.entityId = entityId
      if (ssoUrl) payload.ssoUrl = ssoUrl
      if (acsUrl) payload.acsUrl = acsUrl
      if (spEntityId) payload.spEntityId = spEntityId
      if (metadataUrl) payload.metadataUrl = metadataUrl
      if (certificatePem) payload.certificatePem = certificatePem
      return patchTenantSamlConfig(tenantId, payload)
    },
    onSuccess: async () => {
      toast.success('SAML 配置已保存')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantSamlConfig(tenantId) })
    },
    onError: (error) => toast.error(formatAdminApiError(error)),
  })

  const importMetadataMutation = useMutation({
    mutationFn: () => importTenantSamlMetadata(tenantId),
    onSuccess: async () => {
      toast.success('IdP metadata 已导入')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantSamlConfig(tenantId) })
    },
    onError: (error) => toast.error(formatAdminApiError(error)),
  })

  const rotateSpCertMutation = useMutation({
    mutationFn: () => rotateTenantSamlSpCertificate(tenantId),
    onSuccess: async () => {
      toast.success('SP 签名证书已轮换')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantSamlConfig(tenantId) })
    },
    onError: (error) => toast.error(formatAdminApiError(error)),
  })

  const spMetadataUrl = `${resolveSaasApiBaseUrl(env.VITE_API_URL)}/auth/tenant-sso/saml/${tenantSlug}/metadata`

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={ShieldIcon}
        title="租户 SAML / SSO"
        description="SAML 2.0 SP 连接（Phase 13-1 SP metadata 对外暴露）"
      />
      <div className="px-4 pb-2">
        <a
          className="inline-flex items-center text-sm text-primary hover:underline"
          href={spMetadataUrl}
          rel="noreferrer"
          target="_blank"
        >
          <DownloadIcon className="mr-2 size-4" />
          下载 SP Metadata XML
        </a>
      </div>
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            checked={enabled}
            disabled={readOnly}
            id="saml-enabled"
            onCheckedChange={(checked) => setValue('enabled', checked === true, { shouldDirty: true })}
          />
          <Label htmlFor="saml-enabled">启用 SAML SSO</Label>
        </div>
        <div className="flex flex-wrap gap-2 px-1">
          <AdminStatusPill
            level={idpCert.warn ? 'warn' : config.certificateConfigured ? 'ok' : 'off'}
            label={`IdP 证书 ${idpCert.label}`}
          />
          <AdminStatusPill
            level={spCert.warn ? 'warn' : config.spCertificateConfigured ? 'ok' : 'off'}
            label={`SP 证书 ${spCert.label}`}
          />
        </div>
        {config.lastMetadataSyncAt ? (
          <p className="text-xs text-muted-foreground">
            上次 metadata 同步：{formatAdminDate(config.lastMetadataSyncAt)}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={metadataSyncEnabled}
            disabled={readOnly}
            id="saml-metadata-sync"
            onCheckedChange={(checked) =>
              setValue('metadataSyncEnabled', checked === true, { shouldDirty: true })
            }
          />
          <Label htmlFor="saml-metadata-sync">启用 IdP metadata 自动同步</Label>
        </div>
        <AdminField error={errors.metadataUrl?.message} label="IdP Metadata URL">
          <Input disabled={readOnly} placeholder="https://idp.example/metadata.xml" {...register('metadataUrl')} />
        </AdminField>
        {!readOnly ? (
          <Button
            disabled={importMetadataMutation.isPending}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => importMetadataMutation.mutate()}
          >
            <DownloadIcon className="mr-2 size-4" />
            导入 IdP Metadata
          </Button>
        ) : null}
        <AdminField error={errors.entityId?.message} label="IdP Entity ID">
          <Input disabled={readOnly} {...register('entityId')} />
        </AdminField>
        <AdminField error={errors.ssoUrl?.message} label="IdP SSO URL">
          <Input disabled={readOnly} {...register('ssoUrl')} />
        </AdminField>
        <AdminField error={errors.acsUrl?.message} label="SP ACS URL（可选）">
          <Input disabled={readOnly} placeholder="默认 saas-web 回调" {...register('acsUrl')} />
        </AdminField>
        <AdminField error={errors.spEntityId?.message} label="SP Entity ID（可选）">
          <Input disabled={readOnly} {...register('spEntityId')} />
        </AdminField>
        <AdminField label="SP 签名证书">
          <p className="text-sm text-foreground">
            {config.spCertificateConfigured && config.spCertificateExpiresAt
              ? `已配置，到期 ${formatAdminDate(config.spCertificateExpiresAt)}`
              : config.spCertificateConfigured
                ? '已配置'
                : '未配置'}
          </p>
        </AdminField>
        {!readOnly ? (
          <Button
            disabled={rotateSpCertMutation.isPending}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => rotateSpCertMutation.mutate()}
          >
            <RefreshCwIcon className="mr-2 size-4" />
            轮换 SP 证书
          </Button>
        ) : null}
        <AdminField
          error={errors.certificatePem?.message}
          label={config.certificateConfigured ? 'IdP 证书 PEM（已配置，留空不修改）' : 'IdP 证书 PEM'}
        >
          <Textarea disabled={readOnly} rows={4} {...register('certificatePem')} />
        </AdminField>
        <AdminFormError message={mutation.error ? formatAdminApiError(mutation.error) : null} />
        {!readOnly ? (
          <Button disabled={!isDirty || isSubmitting} type="submit">
            保存 SAML 配置
          </Button>
        ) : null}
      </form>
    </AdminPanel>
  )
}
