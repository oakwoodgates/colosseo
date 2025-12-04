import { useQuery } from '@tanstack/react-query'
import { getModel } from '../api/models'

export function useModel(modelId: string | null) {
  return useQuery({
    queryKey: ['model', modelId],
    queryFn: () => getModel(modelId!),
    enabled: !!modelId,
  })
}
