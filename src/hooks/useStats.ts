import { useQuery } from '@tanstack/react-query'
import { getFinancialSummary, getLeaderboard } from '../api/stats'

export function useFinancialSummary(strategyId?: number) {
  return useQuery({
    queryKey: ['stats', 'summary', strategyId],
    queryFn: () => getFinancialSummary(strategyId),
  })
}

export function useLeaderboard(
  metric: 'total_pnl' | 'win_rate' | 'profit_factor' = 'total_pnl',
  limit = 10,
) {
  return useQuery({
    queryKey: ['stats', 'leaderboard', { metric, limit }],
    queryFn: () => getLeaderboard(metric, limit),
  })
}
