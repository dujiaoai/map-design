import { useCallback, useSyncExternalStore } from 'react'

import { adminBrand } from '~/shared/config/admin-brand'

const STORAGE_KEY = 'saas-admin:product-code'

function readStoredProductCode(): string {
  if (typeof window === 'undefined') return adminBrand.defaultProductCode
  return localStorage.getItem(STORAGE_KEY) ?? adminBrand.defaultProductCode
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener('admin-product-context', onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener('admin-product-context', onStoreChange)
  }
}

export function useAdminProductContext() {
  const productCode = useSyncExternalStore(subscribe, readStoredProductCode, () => adminBrand.defaultProductCode)

  const setProductCode = useCallback((code: string) => {
    localStorage.setItem(STORAGE_KEY, code)
    window.dispatchEvent(new Event('admin-product-context'))
  }, [])

  return { productCode, setProductCode }
}
