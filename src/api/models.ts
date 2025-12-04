import { api } from './client'
import type { ModelMetadata } from './types'

export async function getModel(modelId: string): Promise<ModelMetadata> {
  return api.get<ModelMetadata>(`/models/${modelId}`)
}
