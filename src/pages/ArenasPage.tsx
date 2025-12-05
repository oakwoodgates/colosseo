import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { usePopularArenas } from '../hooks/useArenas'

export default function ArenasPage() {
  const { data, isLoading } = usePopularArenas(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Arenas</h1>
        <div className="text-text-secondary text-sm">
          Ranked by strategy count
        </div>
      </div>

      <Card className="p-0">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle>Popular Trading Arenas</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="p-4 text-text-muted">Loading...</div>
        ) : data && data.arenas.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Trading Pair</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead className="text-right">Strategies</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.arenas.map((arena, index) => (
                <TableRow key={arena.id}>
                  <TableCell>
                    <span className="text-text-muted font-medium">#{index + 1}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{arena.trading_pair}</div>
                    <div className="text-xs text-text-muted">{arena.coin.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge>{arena.exchange.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-text-secondary">{arena.market_type.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{arena.interval}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{arena.strategy_count}</span>
                    {arena.strategies.length > 0 && (
                      <div className="text-xs text-text-muted mt-1">
                        {arena.strategies.slice(0, 3).map((strategyId, i) => (
                          <span key={strategyId}>
                            <Link
                              to={`/strategies/${strategyId}`}
                              className="hover:text-accent"
                            >
                              #{strategyId}
                            </Link>
                            {i < Math.min(arena.strategies.length, 3) - 1 && ', '}
                          </span>
                        ))}
                        {arena.strategies.length > 3 && (
                          <span> +{arena.strategies.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-4 text-text-muted">No arenas found</div>
        )}
      </Card>
    </div>
  )
}
