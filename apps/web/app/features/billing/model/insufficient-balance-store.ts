import { create } from 'zustand'

import type { PaymentRequiredDetail } from '@repo/api-client'

interface InsufficientBalanceStore {
  open: boolean
  detail: PaymentRequiredDetail | null
  show: (detail: PaymentRequiredDetail) => void
  dismiss: () => void
}

export const useInsufficientBalanceStore = create<InsufficientBalanceStore>((set) => ({
  open: false,
  detail: null,
  show: (detail) => set({ open: true, detail }),
  dismiss: () => set({ open: false, detail: null }),
}))
