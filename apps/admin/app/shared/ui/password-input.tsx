import { cn } from '@repo/ui'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { forwardRef, useState } from 'react'

export const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'h-11 w-full rounded-[10px] border border-white/10 bg-[var(--surface-elevated)] px-3 pr-10 text-base text-[var(--text-on-dark)] shadow-[0_0_0_1px_var(--brand-muted)_inset] transition-[color,box-shadow] placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-primary/30 md:text-sm',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center rounded-sm p-1 text-white/45 hover:text-white/80"
          aria-label={visible ? '隐藏密码' : '显示密码'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
    )
  },
)
