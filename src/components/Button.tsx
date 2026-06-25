/** 공용 버튼 */
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'basic' | 'loading' | 'disabled'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** basic: 활성 / loading: 점 로딩+비활성 / disabled: 비활성 */
  variant?: ButtonVariant
}

const base =
  'inline-flex items-center justify-center rounded-md px-10 py-2 text-sm font-medium text-white transition'

const variantCls: Record<ButtonVariant, string> = {
  basic: 'bg-[#3C5DA9] hover:bg-[#33508f]',
  loading: 'bg-[#3C5DA9]/70 cursor-wait',
  disabled: 'bg-[#3C5DA9]/50 cursor-not-allowed',
}

/** 로딩 점 인디케이터 */
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
