import type { ButtonHTMLAttributes } from 'react'

export type ButtonType = 'basic' | 'loading' | 'disabled'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonType
}

const base = 'inline-flex items-center justify-center rounded-md px-10 py-2 text-sm font-medium text-white transition'

const variantCls: Record<ButtonType, string> = {
  basic: 'bg-[#3C5DA9] hover:bg-[#33508f]',
  loading: 'bg-[#3C5DA9]/70 cursor-wait',
  disabled: 'bg-[#3C5DA9]/50 cursor-not-allowed',
}

function LoadingDots() {
  return (
    <span className="flex items-center gap-1" aria-label="로딩 중">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: '-0.3s' }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: '-0.15s' }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  )
}

export default function Button({ variant = 'basic', children, className = '', ...rest }: ButtonProps) {
  const isInactive = variant !== 'basic'

  return (
    <button
      className={`${base} ${variantCls[variant]} ${className}`}
      disabled={isInactive}
      aria-busy={variant === 'loading'}
      {...rest}
    >
      {variant === 'loading' ? <LoadingDots /> : children}
    </button>
  )
}
