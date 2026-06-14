import { InsufficientBalanceDialog } from '~/features/billing/ui/insufficient-balance-dialog'

export function InsufficientBalanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InsufficientBalanceDialog />
    </>
  )
}
