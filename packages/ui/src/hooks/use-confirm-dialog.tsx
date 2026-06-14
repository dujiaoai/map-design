'use client'

import { useCallback, useRef, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type ConfirmDialogOptions = {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type ConfirmState = {
  options: Required<Pick<ConfirmDialogOptions, 'description'>> &
    Omit<ConfirmDialogOptions, 'description'> & {
      title: string
      confirmLabel: string
      cancelLabel: string
    }
  resolve: (value: boolean) => void
}

function ConfirmDialogUi({
  state,
  onResult,
}: {
  state: ConfirmState | null
  onResult: (value: boolean) => void
}) {
  if (!state) return null

  const { options } = state

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onResult(false)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{options.cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={options.destructive ? 'destructive' : 'default'}
            onClick={() => onResult(true)}
          >
            {options.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** 命令式确认弹框，替代 `window.confirm`；须在组件树中渲染返回的 `confirmDialog`。 */
export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState | null>(null)
  const stateRef = useRef<ConfirmState | null>(null)

  const close = useCallback((result: boolean) => {
    const current = stateRef.current
    if (!current) return
    stateRef.current = null
    setState(null)
    current.resolve(result)
  }, [])

  const confirm = useCallback((input: ConfirmDialogOptions | string) => {
    const partial: ConfirmDialogOptions =
      typeof input === 'string' ? { description: input } : input

    return new Promise<boolean>((resolve) => {
      const next: ConfirmState = {
        options: {
          title: partial.title ?? '请确认',
          description: partial.description,
          confirmLabel: partial.confirmLabel ?? '确定',
          cancelLabel: partial.cancelLabel ?? '取消',
          destructive: partial.destructive,
        },
        resolve,
      }
      stateRef.current = next
      setState(next)
    })
  }, [])

  const confirmDialog = <ConfirmDialogUi state={state} onResult={close} />

  return { confirm, confirmDialog }
}
