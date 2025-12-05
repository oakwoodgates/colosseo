import { useQuery } from '@tanstack/react-query'
import { getPopularArenas } from '../api/arenas'

export function usePopularArenas(limit = 50) {
  return useQuery({
    queryKey: ['arenas', 'popular', limit],
    queryFn: () => getPopularArenas(limit),
  })
}
