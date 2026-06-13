import { cn } from '@repo/ui'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { forwardRef, useState, type ReactNode } from 'react'

const inputClassName =
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'

const leadingIconClassName =
  'login-field-icon pointer-events-none absolute top-1/2 left-3 z-[1] size-4 -translate-y-1/2 text-primary/50'

type PasswordInputProps = React.ComponentProps<'input'> & {
  leadingIcon?: ReactNode
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, leadingIcon, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      {leadingIcon ? <span className={leadingIconClassName}>{leadingIcon}</span> : null}
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn(inputClassName, 'pr-9', leadingIcon && 'pl-9', className)}
        {...props}
      />
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 z-[1] flex -translate-y-1/2 items-center justify-center rounded-sm border-0 bg-transparent p-1"
        aria-label={visible ? '隐藏密码' : '显示密码'}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  )
})
