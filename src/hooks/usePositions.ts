import { useQuery } from '@tanstack/react-query'
import { getPositions, getStrategyPositions, getOpenPositions } from '../api/positions'

export function usePositions(strategyId?: number, status?: 'open' | 'closed') {
  return useQuery({
    queryKey: ['positions', { strategyId, status }],
    queryFn: () => getPositions({ strategyId, status }),
  })
}

export function useStrategyPositions(
  strategyId: number,
  status?: 'open' | 'closed',
  limit = 100,
  offset = 0,
) {
  return useQuery({
    queryKey: ['strategy', strategyId, 'positions', { status, limit, offset }],
    queryFn: () => getStrategyPositions(strategyId, status, limit, offset),
    enabled: strategyId > 0,
  })
}

export function useOpenPositions(strategyId?: number) {
  return useQuery({
    queryKey: ['positions', 'open', strategyId],
    queryFn: () => getOpenPositions(strategyId),
    refetchInterval: 10000, // Poll every 10 seconds
  })
}
