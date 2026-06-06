import { cn } from '@repo/ui'

export interface MockStepItem {
  label: string
  detail?: string
  done?: boolean
  active?: boolean
}

export function MockStepGuide({ steps }: { steps: MockStepItem[] }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((step, index) => (
        <li
          key={step.label}
          className={cn(
            'flex gap-2 rounded-md border px-2 py-1.5 text-xs',
            step.active
              ? 'border-primary/40 bg-primary/10 text-foreground'
              : 'border-border bg-muted/30 text-muted-foreground dark:border-white/10 dark:bg-white/5',
            step.done && !step.active && 'opacity-70',
          )}
        >
          <span
            className={cn(
              'cc-mono flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-medium',
              step.active
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
            aria-hidden
          >
            {step.done ? '✓' : index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground/90 font-medium">{step.label}</p>
            {step.detail ? <p className="text-muted-foreground mt-0.5">{step.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
