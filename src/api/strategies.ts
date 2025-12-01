import { api } from './client'
import type { Strategy, StrategyWithStats, StrategyListResponse } from './types'

export async function getStrategies(activeOnly = true): Promise<StrategyListResponse> {
  return api.get<StrategyListResponse>(`/strategies?active_only=${activeOnly}`)
}

export async function getStrategy(id: number): Promise<Strategy> {
  return api.get<Strategy>(`/strategies/${id}`)
}

export async function getStrategyWithStats(id: number): Promise<StrategyWithStats> {
  return api.get<StrategyWithStats>(`/strategies/${id}/stats`)
}
