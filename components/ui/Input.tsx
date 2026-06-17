'use client'
import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: LucideIcon
  /** Extra content rendered on the right (e.g. a unit, a button). */
  rightSlot?: React.ReactNode
  containerClassName?: string
}

/**
 * Premium text field. The whole field glows on focus (focus-within ring),
 * matching the Button primitive's brand language. Password fields get a
 * built-in show/hide toggle.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon: LeftIcon, rightSlot, type = 'text', className, containerClassName, id, disabled, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (reveal ? 'text' : 'password') : type

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 text-foreground/90">
          {label}
        </label>
      )}

      <div
        className={cn(
          'group flex items-center gap-2.5 rounded-xl border bg-card px-3.5 transition-all duration-200',
          'focus-within:ring-4',
          error
            ? 'border-destructive focus-within:border-destructive focus-within:ring-destructive/15'
            : 'border-border focus-within:border-primary focus-within:ring-primary/15',
          disabled && 'opacity-60',
        )}
      >
        {LeftIcon && (
          <LeftIcon
            size={17}
            className={cn(
              'shrink-0 transition-colors',
              error ? 'text-destructive/70' : 'text-muted-foreground group-focus-within:text-primary',
            )}
          />
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/55',
            'disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={reveal}
            className="shrink-0 grid place-items-center w-8 h-8 -mr-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {rightSlot}
      </div>

      {error ? (
        <p className="text-xs text-destructive mt-1.5">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>
      ) : null}
    </div>
  )
})
