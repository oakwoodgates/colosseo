import { useQuery } from '@tanstack/react-query'
import { getTrades, getStrategyTrades, getRecentTrades } from '../api/trades'

export function useTrades(strategyId?: number, limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['trades', { strategyId, limit, offset }],
    queryFn: () => getTrades({ strategyId, limit, offset }),
  })
}

export function useStrategyTrades(strategyId: number, limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['strategy', strategyId, 'trades', { limit, offset }],
    queryFn: () => getStrategyTrades(strategyId, limit, offset),
    enabled: strategyId > 0,
  })
}

export function useRecentTrades(limit = 10) {
  return useQuery({
    queryKey: ['trades', 'recent', limit],
    queryFn: () => getRecentTrades(limit),
    refetchInterval: 5000, // Poll every 5 seconds for recent trades
  })
}
