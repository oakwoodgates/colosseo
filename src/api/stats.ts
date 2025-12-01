import { api } from './client'
import type { FinancialSummary, LeaderboardResponse } from './types'

export async function getFinancialSummary(strategyId?: number): Promise<FinancialSummary> {
  const params = strategyId ? `?strategy_id=${strategyId}` : ''
  return api.get<FinancialSummary>(`/stats/summary${params}`)
}

export async function getLeaderboard(
  metric: 'total_pnl' | 'win_rate' | 'profit_factor' = 'total_pnl',
  limit = 10,
): Promise<LeaderboardResponse> {
  return api.get<LeaderboardResponse>(`/stats/leaderboard?metric=${metric}&limit=${limit}`)
}
