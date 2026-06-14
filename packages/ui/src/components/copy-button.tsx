import { CheckIcon, CopyIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from './ui/button'

export function CopyButton({
  value,
  'aria-label': ariaLabel = '复制',
  onCopied,
  onCopyError,
}: {
  value: string
  'aria-label'?: string
  onCopied?: () => void
  onCopyError?: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopied?.()
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      onCopyError?.()
    }
  }, [value, onCopied, onCopyError])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="text-muted-foreground hover:text-foreground shrink-0"
      aria-label={ariaLabel}
      onClick={() => void handleCopy()}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
