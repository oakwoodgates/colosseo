import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Stat } from '../components/ui/Stat'
import { Badge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { PriceChart } from '../components/charts/PriceChart'
import { useStrategyWithStats } from '../hooks/useStrategies'
import { useStrategyTrades } from '../hooks/useTrades'
import { useStrategyPositions } from '../hooks/usePositions'
import { formatUSD, formatPercent, formatTimestamp, getPnlTrend } from '../utils/format'

export default function StrategyPage() {
  const { id } = useParams<{ id: string }>()
  const strategyId = Number(id)

  const [positionTab, setPositionTab] = useState<'open' | 'closed'>('open')

  const { data: strategy, isLoading: strategyLoading } = useStrategyWithStats(strategyId)
  const { data: tradesData, isLoading: tradesLoading } = useStrategyTrades(strategyId, 50)
  const { data: positionsData, isLoading: positionsLoading } = useStrategyPositions(
    strategyId,
    positionTab,
    50,
  )

  if (strategyLoading) {
    return <div className="text-text-muted">Loading strategy...</div>
  }

  if (!strategy) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted mb-4">Strategy not found</div>
        <Link to="/strategies" className="text-accent hover:text-accent-light">
          Back to strategies
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/strategies" className="text-text-muted hover:text-text-primary">
              &larr;
            </Link>
            <h1 className="text-2xl font-bold">{strategy.strategy_name}</h1>
            <Badge variant={strategy.is_active ? 'success' : 'default'}>
              {strategy.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="text-text-secondary mt-1">
            {strategy.interval} interval &bull; Version {strategy.version}
          </div>
        </div>
      </div>

      {/* Stats */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <Stat
            label="Total P&L"
            value={formatUSD(strategy.total_pnl_usd)}
            subValue={formatPercent(strategy.total_pnl_pct)}
            trend={getPnlTrend(strategy.total_pnl_usd)}
          />
          <Stat
            label="Win Rate"
            value={`${strategy.win_rate.toFixed(1)}%`}
            trend={strategy.win_rate >= 50 ? 'up' : 'down'}
          />
          <Stat
            label="Profit Factor"
            value={strategy.profit_factor.toFixed(2)}
            trend={strategy.profit_factor >= 1 ? 'up' : 'down'}
          />
          <Stat label="Total Trades" value={strategy.total_trades} />
          <Stat label="Open Positions" value={strategy.open_positions} />
        </div>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <PriceChart
          strategyId={strategyId}
          interval={strategy.interval}
          trades={tradesData?.trades}
        />
      </Card>

      {/* Trades and Positions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trades */}
        <Card className="p-0">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          {tradesLoading ? (
            <div className="p-4 text-text-muted">Loading...</div>
          ) : tradesData && tradesData.trades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradesData.trades.slice(0, 10).map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>
                      <Badge
                        variant={
                          trade.trade_type.includes('open') ? 'success' : 'danger'
                        }
                      >
                        {trade.trade_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatUSD(trade.size)}</TableCell>
                    <TableCell className="text-right">${trade.price.toFixed(4)}</TableCell>
                    <TableCell className="text-right text-text-muted text-xs">
                      {formatTimestamp(trade.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 text-text-muted">No trades yet</div>
          )}
        </Card>

        {/* Positions */}
        <Card className="p-0">
          <CardHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle>Positions</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => setPositionTab('open')}
                  className={`px-3 py-1 rounded text-sm ${
                    positionTab === 'open'
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setPositionTab('closed')}
                  className={`px-3 py-1 rounded text-sm ${
                    positionTab === 'closed'
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>
          </CardHeader>
          {positionsLoading ? (
            <div className="p-4 text-text-muted">Loading...</div>
          ) : positionsData && positionsData.positions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionsData.positions.slice(0, 10).map((position) => {
                  const pnl = position.realized_pnl ?? position.unrealized_pnl ?? 0
                  return (
                    <TableRow key={position.id}>
                      <TableCell>
                        <Badge variant={position.side === 'long' ? 'success' : 'danger'}>
                          {position.side}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatUSD(position.size)}</TableCell>
                      <TableCell className="text-right">
                        ${position.entry_price.toFixed(4)}
                      </TableCell>
                      <TableCell className={`text-right ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatUSD(pnl)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 text-text-muted">No {positionTab} positions</div>
          )}
        </Card>
      </div>
    </div>
  )
}
