import { useQuery } from '@tanstack/react-query'
import { getPortfolioSummary, getEquityHistory } from '../api/portfolio'

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: getPortfolioSummary,
    refetchInterval: 10000, // Poll every 10 seconds
  })
}

export function useEquityHistory(limit = 1000) {
  return useQuery({
    queryKey: ['portfolio', 'history', limit],
    queryFn: () => getEquityHistory(limit),
  })
}
