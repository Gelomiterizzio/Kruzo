'use client'
import { cn } from '@/lib/utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Accessible name for the control. */
  label: string
  disabled?: boolean
}

/** Keyboard- and screen-reader-accessible toggle (role="switch"). */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'bg-primary' : 'bg-muted-foreground/30',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
