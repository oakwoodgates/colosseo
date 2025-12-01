import type { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="border-b border-border">{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

export function TableRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <tr className={`hover:bg-bg-tertiary/50 ${className}`}>{children}</tr>
}

export function TableHead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-sm font-medium text-text-secondary ${className}`}>
      {children}
    </th>
  )
}

export function TableCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>
}
