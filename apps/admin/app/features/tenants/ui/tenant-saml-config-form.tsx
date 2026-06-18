import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, Checkbox, Input, Label, Textarea, toast } from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { AdminTenantSamlConfig } from '~/entities/tenant/model'
import { patchTenantSamlConfig } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { ShieldIcon } from 'lucide-react'

const schema = z.object({
  enabled: z.boolean(),
  entityId: z.string().max(512),
  ssoUrl: z.string().max(1024),
  acsUrl: z.string().max(1024),
  spEntityId: z.string().max(512),
  certificatePem: z.string().max(8192),
})

type FormValues = z.infer<typeof schema>

export function TenantSamlConfigForm({
  tenantId,
  config,
  readOnly,
}: {
  tenantId: string
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
      entityId: '',
      ssoUrl: '',
      acsUrl: '',
      spEntityId: '',
      certificatePem: '',
    },
  })

  const enabled = watch('enabled')

  useEffect(() => {
    reset({
      enabled: config.enabled,
      entityId: config.entityId ?? '',
      ssoUrl: config.ssoUrl ?? '',
      acsUrl: config.acsUrl ?? '',
      spEntityId: config.spEntityId ?? '',
      certificatePem: '',
    })
  }, [config, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: Parameters<typeof patchTenantSamlConfig>[1] = { enabled: values.enabled }
      const entityId = values.entityId.trim()
      const ssoUrl = values.ssoUrl.trim()
      const acsUrl = values.acsUrl.trim()
      const spEntityId = values.spEntityId.trim()
      const certificatePem = values.certificatePem.trim()
      if (entityId) payload.entityId = entityId
      if (ssoUrl) payload.ssoUrl = ssoUrl
      if (acsUrl) payload.acsUrl = acsUrl
      if (spEntityId) payload.spEntityId = spEntityId
      if (certificatePem) payload.certificatePem = certificatePem
      return patchTenantSamlConfig(tenantId, payload)
    },
    onSuccess: async () => {
      toast.success('SAML 配置已保存')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantSamlConfig(tenantId) })
    },
    onError: (error) => toast.error(formatAdminApiError(error)),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={ShieldIcon}
        title="租户 SAML / SSO"
        description="SAML 2.0 SP 连接（Phase 11-1）"
      />
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
