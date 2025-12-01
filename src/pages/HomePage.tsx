import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Stat } from '../components/ui/Stat'
import { Badge } from '../components/ui/Badge'
import { usePortfolioSummary } from '../hooks/usePortfolio'
import { useRecentTrades } from '../hooks/useTrades'
import { useLeaderboard } from '../hooks/useStats'
import { useConnectionStatus } from '../hooks/useWebSocket'
import { formatUSD, formatPercent, formatRelativeTime, getPnlTrend } from '../utils/format'

export default function HomePage() {
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioSummary()
  const { data: recentTrades, isLoading: tradesLoading } = useRecentTrades(5)
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard('total_pnl', 3)
  const isConnected = useConnectionStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Badge variant={isConnected ? 'success' : 'danger'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {/* Portfolio Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        {portfolioLoading ? (
          <div className="text-text-muted">Loading...</div>
        ) : portfolio ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat
              label="Total Equity"
              value={formatUSD(portfolio.total_capital_usd)}
            />
            <Stat
              label="Total P&L"
              value={formatUSD(portfolio.total_pnl_usd)}
              subValue={formatPercent(portfolio.total_pnl_pct)}
              trend={getPnlTrend(portfolio.total_pnl_usd)}
            />
            <Stat
              label="Open Positions"
              value={portfolio.open_positions}
            />
            <Stat
              label="Active Strategies"
              value={portfolio.active_strategies}
            />
          </div>
        ) : (
          <div className="text-text-muted">No data</div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Trades</CardTitle>
              <Link to="/strategies" className="text-sm text-accent hover:text-accent-light">
                View all
              </Link>
            </div>
          </CardHeader>
          {tradesLoading ? (
            <div className="text-text-muted">Loading...</div>
          ) : recentTrades && recentTrades.length > 0 ? (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {trade.trade_type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {trade.strategy_name || `Strategy ${trade.strategy_id}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatUSD(trade.size)}</div>
                    <div className="text-sm text-text-muted">
                      {formatRelativeTime(trade.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-text-muted">No recent trades</div>
          )}
        </Card>

        {/* Top Strategies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Strategies</CardTitle>
              <Link to="/strategies" className="text-sm text-accent hover:text-accent-light">
                View leaderboard
              </Link>
            </div>
          </CardHeader>
          {leaderboardLoading ? (
            <div className="text-text-muted">Loading...</div>
          ) : leaderboard && leaderboard.entries.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.entries.map((entry) => (
                <Link
                  key={entry.strategy_id}
                  to={`/strategies/${entry.strategy_id}`}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-bg-tertiary/50 -mx-2 px-2 rounded"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">#{entry.rank}</span>
                      <span className="font-medium">{entry.strategy_name}</span>
                    </div>
                    <div className="text-sm text-text-secondary">{entry.interval}</div>
                  </div>
                  <div className="text-right">
                    <div className={entry.total_pnl_usd >= 0 ? 'text-profit' : 'text-loss'}>
                      {formatUSD(entry.total_pnl_usd)}
                    </div>
                    <div className="text-sm text-text-muted">
                      {entry.win_rate.toFixed(1)}% win rate
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-text-muted">No strategies yet</div>
          )}
        </Card>
      </div>
    </div>
  )
}
