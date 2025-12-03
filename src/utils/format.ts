export function formatUSD(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`
  }
  if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(2)}K`
  }
  return `${sign}$${absValue.toFixed(2)}`
}

export function formatBankroll(value: number, decimals = 2): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (absValue >= 1_000_000 && 0 === decimals) {
    return `$${(absValue / 1_000_000).toFixed(0)}M`
  }
  if (absValue >= 1_000 && 0 === decimals) {
    return `$${(absValue / 1_000).toFixed(0)}K`
  }
  return `${sign}$${absValue.toFixed(decimals)}`
}


export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getPnlTrend(value: number): 'up' | 'down' | 'neutral' {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'neutral'
}
