import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { useSession } from '@repo/auth'
import { useQuery } from '@tanstack/react-query'
import { BoxesIcon } from 'lucide-react'

import { fetchAdminProducts } from '~/shared/api/admin-api'
import { isPlatformAdmin } from '~/shared/auth/admin-access'
import { useAdminProductContext } from '~/shared/hooks/use-admin-product-context'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'

export function AdminProductSelector() {
  const session = useSession()
  const { productCode, setProductCode } = useAdminProductContext()
  const productsQuery = useQuery({
    queryKey: adminQueryKeys.products,
    queryFn: fetchAdminProducts,
    enabled: isPlatformAdmin(session),
    staleTime: 300_000,
  })

  if (!isPlatformAdmin(session)) return null
  const products = productsQuery.data?.products ?? []

  return (
    <div className="border-t border-border/60 px-3 py-3">
      <label className="mb-1.5 flex items-center gap-1.5 text-[10px] tracking-wide text-muted-foreground uppercase">
        <BoxesIcon className="size-3" aria-hidden />
        产品线
      </label>
      <Select value={productCode} onValueChange={(value) => value && setProductCode(value)}>
        <SelectTrigger className="h-8 w-full text-xs">
          <SelectValue placeholder="选择产品" />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.code}>
              {product.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
