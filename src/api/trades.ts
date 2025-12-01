import { api } from './client'
import type { Trade, TradeListResponse } from './types'

interface TradeQueryParams {
  strategyId?: number
  limit?: number
  offset?: number
}

export async function getTrades(params: TradeQueryParams = {}): Promise<TradeListResponse> {
  const searchParams = new URLSearchParams()
  if (params.strategyId) searchParams.set('strategy_id', String(params.strategyId))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.offset) searchParams.set('offset', String(params.offset))

  const query = searchParams.toString()
  return api.get<TradeListResponse>(`/trades${query ? `?${query}` : ''}`)
}

export async function getStrategyTrades(
  strategyId: number,
  limit = 100,
  offset = 0,
): Promise<TradeListResponse> {
  return api.get<TradeListResponse>(
    `/strategies/${strategyId}/trades?limit=${limit}&offset=${offset}`,
  )
}

export async function getRecentTrades(limit = 10): Promise<Trade[]> {
  return api.get<Trade[]>(`/trades/recent?limit=${limit}`)
}

export async function getTrade(id: number): Promise<Trade> {
  return api.get<Trade>(`/trades/${id}`)
}
