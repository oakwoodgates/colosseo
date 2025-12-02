import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { useTrades } from '../hooks/useTrades'
import { formatUSD, formatTimestamp } from '../utils/format'

type TradeTypeFilter = 'all' | 'open_long' | 'open_short' | 'close_long' | 'close_short'

const TRADES_PER_PAGE = 50

export default function TradesPage() {
  const [typeFilter, setTypeFilter] = useState<TradeTypeFilter>('all')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useTrades(undefined, TRADES_PER_PAGE, page * TRADES_PER_PAGE)

  const filters: { value: TradeTypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'open_long', label: 'Open Long' },
    { value: 'open_short', label: 'Open Short' },
    { value: 'close_long', label: 'Close Long' },
    { value: 'close_short', label: 'Close Short' },
  ]

  // Filter trades by type (client-side for now)
  const filteredTrades = data?.trades.filter(
    (trade) => typeFilter === 'all' || trade.trade_type === typeFilter
  ) ?? []

  const totalPages = data ? Math.ceil(data.total / TRADES_PER_PAGE) : 0

  function getTradeTypeBadgeVariant(type: string): 'success' | 'danger' | 'default' {
    if (type.includes('open')) return 'success'
    if (type.includes('close')) return 'danger'
    return 'default'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trades</h1>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setTypeFilter(f.value)
                setPage(0)
              }}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                typeFilter === f.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0">
        <CardHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>
              {typeFilter === 'all' ? 'All Trades' : `${filters.find(f => f.value === typeFilter)?.label} Trades`}
            </CardTitle>
            {data && (
              <span className="text-sm text-text-muted">
                {data.total} total trades
              </span>
            )}
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="p-4 text-text-muted">Loading...</div>
        ) : filteredTrades.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>
                      <Badge variant={getTradeTypeBadgeVariant(trade.trade_type)}>
                        {trade.trade_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/strategies/${trade.strategy_id}`}
                        className="text-text-primary hover:text-accent"
                      >
                        {trade.strategy_name ?? `Strategy #${trade.strategy_id}`}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      {trade.size}
                    </TableCell>
                    <TableCell className="text-right">
                      ${trade.price.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right text-text-muted">
                      {formatUSD(trade.fees)}
                    </TableCell>
                    <TableCell className="text-right text-text-muted text-sm">
                      {formatTimestamp(trade.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-bg-tertiary text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-text-muted">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-bg-tertiary text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 text-text-muted">No trades found</div>
        )}
      </Card>
    </div>
  )
}
