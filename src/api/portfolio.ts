import { api } from './client'
import type { PortfolioSummary, EquityHistoryResponse } from './types'

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  return api.get<PortfolioSummary>('/portfolio/summary')
}

export async function getEquityHistory(limit = 1000): Promise<EquityHistoryResponse> {
  return api.get<EquityHistoryResponse>(`/portfolio/history?limit=${limit}`)
}
