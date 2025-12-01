interface StatProps {
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function Stat({ label, value, subValue, trend }: StatProps) {
  const trendColor =
    trend === 'up'
      ? 'text-profit'
      : trend === 'down'
        ? 'text-loss'
        : 'text-text-primary'

  return (
    <div>
      <div className="text-sm text-text-secondary mb-1">{label}</div>
      <div className={`text-xl font-semibold ${trendColor}`}>{value}</div>
      {subValue && <div className="text-sm text-text-muted">{subValue}</div>}
    </div>
  )
}
