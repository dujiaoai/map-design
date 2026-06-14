import type { AdminPackage } from '~/features/billing/lib/billing-admin-api'

export type PackageFormState = {
  code: string
  points: string
  priceCents: string
  currency: string
  status: string
  sortOrder: string
}

export const defaultPackageFormState: PackageFormState = {
  code: '',
  points: '',
  priceCents: '',
  currency: 'CNY',
  status: 'active',
  sortOrder: '0',
}

export function packageToFormState(pkg: AdminPackage): PackageFormState {
  return {
    code: pkg.code,
    points: String(pkg.points),
    priceCents: String(pkg.priceCents),
    currency: pkg.currency,
    status: pkg.status,
    sortOrder: String(pkg.sortOrder),
  }
}

export function parsePackageFormState(form: PackageFormState, mode: 'create' | 'edit') {
  const points = Number(form.points)
  const priceCents = Number(form.priceCents)
  const sortOrder = Number(form.sortOrder)

  if (!Number.isFinite(points) || points < 1) {
    throw new Error('积分须为大于 0 的整数')
  }
  if (!Number.isFinite(priceCents) || priceCents < 1) {
    throw new Error('售价（分）须为大于 0 的整数')
  }
  if (!Number.isFinite(sortOrder)) {
    throw new Error('排序须为整数')
  }

  if (mode === 'create') {
    const code = form.code.trim()
    if (!code) throw new Error('SKU 代码不能为空')
    return {
      code,
      points,
      priceCents,
      currency: form.currency.trim() || 'CNY',
      status: form.status,
      sortOrder,
    }
  }

  return {
    points,
    priceCents,
    currency: form.currency.trim() || 'CNY',
    status: form.status,
    sortOrder,
  }
}
