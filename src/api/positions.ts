import { api } from './client'
import type { Position, PositionListResponse } from './types'

interface PositionQueryParams {
  strategyId?: number
  status?: 'open' | 'closed'
  limit?: number
  offset?: number
}

export async function getPositions(params: PositionQueryParams = {}): Promise<PositionListResponse> {
  const searchParams = new URLSearchParams()
  if (params.strategyId) searchParams.set('strategy_id', String(params.strategyId))
  if (params.status) searchParams.set('status', params.status)
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.offset) searchParams.set('offset', String(params.offset))

  const query = searchParams.toString()
  return api.get<PositionListResponse>(`/positions${query ? `?${query}` : ''}`)
}

export async function getStrategyPositions(
  strategyId: number,
  status?: 'open' | 'closed',
  limit = 100,
  offset = 0,
): Promise<PositionListResponse> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (status) params.set('status', status)
  return api.get<PositionListResponse>(`/strategies/${strategyId}/positions?${params}`)
}

export async function getOpenPositions(strategyId?: number): Promise<Position[]> {
  const params = strategyId ? `?strategy_id=${strategyId}` : ''
  return api.get<Position[]>(`/positions/open${params}`)
}

export async function getPosition(id: number): Promise<Position> {
  return api.get<Position>(`/positions/${id}`)
}
