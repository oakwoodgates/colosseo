import { api } from './client'
import type { PopularArenaListResponse } from './types'

export async function getPopularArenas(limit = 50): Promise<PopularArenaListResponse> {
  return api.get<PopularArenaListResponse>(`/arenas/popular?limit=${limit}`)
}
