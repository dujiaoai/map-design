import {
  Button,
  Drawer,
  DrawerClose,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@repo/ui'
import { CoinsIcon } from 'lucide-react'
import { Link } from 'react-router'

import { formatPoints } from '~/features/billing/lib/format-points'
import { useInsufficientBalanceStore } from '~/features/billing/model/insufficient-balance-store'

export function InsufficientBalanceDialog() {
  const open = useInsufficientBalanceStore((state) => state.open)
  const detail = useInsufficientBalanceStore((state) => state.detail)
  const dismiss = useInsufficientBalanceStore((state) => state.dismiss)

  const available = detail?.availableBalance
  const required = detail?.requiredPoints

  return (
    <Drawer open={open} onOpenChange={(next) => !next && dismiss()} direction="bottom">
      <DrawerContent className="mx-auto max-w-lg">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <CoinsIcon className="size-5 text-primary" />
            积分不足
          </DrawerTitle>
          <DrawerDescription>
            {detail?.detail ?? '当前可用积分不足以完成此操作，请先充值或联系团队管理员。'}
          </DrawerDescription>
        </DrawerHeader>

        {available !== undefined || required !== undefined ? (
          <div className="text-muted-foreground grid grid-cols-2 gap-3 px-4 text-sm">
            {available !== undefined ? (
              <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                <p className="text-xs">可用余额</p>
                <p className="font-mono text-base font-medium tabular-nums">
                  {formatPoints(available)} 点
                </p>
              </div>
            ) : null}
            {required !== undefined ? (
              <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                <p className="text-xs">本次需要</p>
                <p className="font-mono text-base font-medium tabular-nums">
                  {formatPoints(required)} 点
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <DrawerFooter className="flex-row justify-end gap-2">
          <DrawerCloseButton variant="outline">稍后再说</DrawerCloseButton>
          <Button nativeButton={false} render={<Link to="/billing" onClick={() => dismiss()} />}>
            去充值
          </Button>
          <DrawerClose className="sr-only" />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
