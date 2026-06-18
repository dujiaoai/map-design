import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, Checkbox, Input, Label, toast } from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { AdminTenantOidcConfig } from '~/entities/tenant/model'
import { patchTenantOidcConfig } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  enabled: z.boolean(),
  displayName: z.string().max(128),
  issuerUri: z.string().max(512),
  clientId: z.string().max(128),
  clientSecret: z.string().max(512),
  scopes: z.string().max(256),
})

type FormValues = z.infer<typeof schema>

export function TenantOidcConfigForm({
  tenantId,
  config,
  readOnly,
}: {
  tenantId: string
  config: AdminTenantOidcConfig
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
      displayName: '',
      issuerUri: '',
      clientId: '',
      clientSecret: '',
      scopes: '',
    },
  })

  const enabled = watch('enabled')

  useEffect(() => {
    reset({
      enabled: config.enabled,
      displayName: config.displayName ?? '',
      issuerUri: config.issuerUri ?? '',
      clientId: config.clientId ?? '',
      clientSecret: '',
      scopes: config.scopes ?? '',
    })
  }, [config, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: Parameters<typeof patchTenantOidcConfig>[1] = {
        enabled: values.enabled,
      }
      const displayName = values.displayName.trim()
      const issuerUri = values.issuerUri.trim()
      const clientId = values.clientId.trim()
      const clientSecret = values.clientSecret.trim()
      const scopes = values.scopes.trim()
      if (displayName) payload.displayName = displayName
      if (issuerUri) payload.issuerUri = issuerUri
      if (clientId) payload.clientId = clientId
      if (clientSecret) payload.clientSecret = clientSecret
      if (scopes) payload.scopes = scopes
      return patchTenantOidcConfig(tenantId, payload)
    },
    onSuccess: async () => {
      toast.success('OIDC 配置已保存')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantOidcConfig(tenantId) })
    },
    onError: (error) => {
      toast.error(formatAdminApiError(error, '保存 OIDC 配置失败'))
    },
  })

  function onSubmit(values: FormValues) {
    if (values.enabled && (!values.issuerUri.trim() || !values.clientId.trim())) {
      toast.error('启用 SSO 时须填写 Issuer URI 与 Client ID')
      return
    }
    if (values.enabled && !config.clientSecretConfigured && !values.clientSecret.trim()) {
      toast.error('启用 SSO 时须填写 Client Secret')
      return
    }
    mutation.mutate(values)
  }

  return (
    <form className="space-y-4 px-4 pb-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`oidc-enabled-${tenantId}`}
          checked={enabled}
          disabled={readOnly || isSubmitting}
          onCheckedChange={(checked) => setValue('enabled', checked === true, { shouldDirty: true })}
        />
        <Label htmlFor={`oidc-enabled-${tenantId}`}>启用租户 SSO</Label>
      </div>
      <AdminField label="展示名" error={errors.displayName?.message}>
        <Input
          {...register('displayName')}
          placeholder="Corp SSO"
          disabled={readOnly || isSubmitting}
          aria-label="OIDC 展示名"
        />
      </AdminField>
      <AdminField label="Issuer URI" error={errors.issuerUri?.message}>
        <Input
          {...register('issuerUri')}
          placeholder="https://idp.example.com"
          disabled={readOnly || isSubmitting}
          className="font-mono text-xs"
          aria-label="OIDC Issuer URI"
        />
      </AdminField>
      <AdminField label="Client ID" error={errors.clientId?.message}>
        <Input
          {...register('clientId')}
          placeholder="oauth-client-id"
          disabled={readOnly || isSubmitting}
          className="font-mono text-xs"
          aria-label="OIDC Client ID"
        />
      </AdminField>
      <AdminField
        label="Client Secret"
        hint={
          config.clientSecretConfigured
            ? '已保存；留空表示不更新'
            : '启用 SSO 时必填'
        }
        error={errors.clientSecret?.message}
      >
        <Input
          {...register('clientSecret')}
          type="password"
          placeholder={config.clientSecretConfigured ? '••••••••' : 'oauth-client-secret'}
          disabled={readOnly || isSubmitting}
          className="font-mono text-xs"
          aria-label="OIDC Client Secret"
        />
      </AdminField>
      <AdminField label="Scopes" hint="空格分隔，默认 openid profile email" error={errors.scopes?.message}>
        <Input
          {...register('scopes')}
          placeholder="openid profile email"
          disabled={readOnly || isSubmitting}
          className="font-mono text-xs"
          aria-label="OIDC Scopes"
        />
      </AdminField>
      <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
      {!readOnly ? (
        <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
          保存 OIDC 配置
        </Button>
      ) : null}
    </form>
  )
}
