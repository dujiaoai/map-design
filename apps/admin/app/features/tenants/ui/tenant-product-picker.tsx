import { cn } from '@repo/ui'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

import type { AdminProduct } from '~/shared/api/admin-api'

export function TenantProductPicker<T extends FieldValues>({
  control,
  name,
  products,
  disabled,
}: {
  control: Control<T>
  name: Path<T>
  products: AdminProduct[]
  disabled?: boolean
}) {
  if (products.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">暂无可选产品线，请先在「产品线」页注册。</p>
    )
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="grid gap-2">
          {products.map((product) => {
            const selected = field.value === product.code
            return (
              <button
                key={product.id}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => field.onChange(product.code)}
                className={cn(
                  'admin-create-plan-chip relative z-10 cursor-pointer rounded-xl border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60',
                  selected
                    ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
                    : 'border-border/50 bg-background/20 hover:border-primary/25',
                )}
              >
                <p className="text-sm font-medium">{product.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{product.code}</p>
                {product.description ? (
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                ) : null}
              </button>
            )
          })}
        </div>
      )}
    />
  )
}
