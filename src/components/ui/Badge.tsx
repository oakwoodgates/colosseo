import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-bg-tertiary text-text-secondary',
    success: 'bg-profit/20 text-profit',
    danger: 'bg-loss/20 text-loss',
    warning: 'bg-yellow-500/20 text-yellow-500',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
