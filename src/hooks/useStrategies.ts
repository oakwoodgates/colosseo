import { useQuery } from '@tanstack/react-query'
import { getStrategies, getStrategy, getStrategyWithStats } from '../api/strategies'

export function useStrategies(activeOnly = true) {
  return useQuery({
    queryKey: ['strategies', { activeOnly }],
    queryFn: () => getStrategies(activeOnly),
  })
}

export function useStrategy(id: number) {
  return useQuery({
    queryKey: ['strategy', id],
    queryFn: () => getStrategy(id),
    enabled: id > 0,
  })
}

export function useStrategyWithStats(id: number) {
  return useQuery({
    queryKey: ['strategy', id, 'stats'],
    queryFn: () => getStrategyWithStats(id),
    enabled: id > 0,
  })
}
