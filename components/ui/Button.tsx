'use client'
import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { buttonVariants, type ButtonVariant, type ButtonSize } from './button-variants'

export { buttonVariants } from './button-variants'
export type { ButtonVariant, ButtonSize } from './button-variants'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {loading && <Loader2 size={size === 'lg' ? 18 : 16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
})
