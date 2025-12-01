import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { useLeaderboard } from '../hooks/useStats'
import { formatUSD, formatPercent } from '../utils/format'

type Metric = 'total_pnl' | 'win_rate' | 'profit_factor'

export default function StrategiesPage() {
  const [metric, setMetric] = useState<Metric>('total_pnl')
  const { data: leaderboard, isLoading } = useLeaderboard(metric, 50)

  const metrics: { value: Metric; label: string }[] = [
    { value: 'total_pnl', label: 'P&L' },
    { value: 'win_rate', label: 'Win Rate' },
    { value: 'profit_factor', label: 'Profit Factor' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Strategies</h1>
        <div className="flex gap-2">
          {metrics.map((m) => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                metric === m.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle>Leaderboard - Ranked by {metrics.find((m) => m.value === metric)?.label}</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="p-4 text-text-muted">Loading...</div>
        ) : leaderboard && leaderboard.entries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Profit Factor</TableHead>
                <TableHead className="text-right">Trades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.entries.map((entry) => (
                <TableRow key={entry.strategy_id}>
                  <TableCell>
                    <span className="text-text-muted font-medium">#{entry.rank}</span>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/strategies/${entry.strategy_id}`}
                      className="font-medium text-text-primary hover:text-accent"
                    >
                      {entry.strategy_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge>{entry.interval}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={entry.total_pnl_usd >= 0 ? 'text-profit' : 'text-loss'}>
                      {formatUSD(entry.total_pnl_usd)}
                    </span>
                    <div className="text-xs text-text-muted">
                      {formatPercent(entry.total_pnl_pct)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={entry.win_rate >= 50 ? 'text-profit' : 'text-loss'}>
                      {entry.win_rate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={entry.profit_factor >= 1 ? 'text-profit' : 'text-loss'}>
                      {entry.profit_factor.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {entry.total_trades}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-4 text-text-muted">No strategies found</div>
        )}
      </Card>
    </div>
  )
}
